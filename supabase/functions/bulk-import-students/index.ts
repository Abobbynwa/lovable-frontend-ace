import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Validation functions
function validateEmail(email: string): void {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error('Invalid email format');
  }
  if (email.length > 255) {
    throw new Error('Email must be less than 255 characters');
  }
}

function validatePassword(password: string): void {
  if (password.length < 8) {
    throw new Error('Password must be at least 8 characters');
  }
  if (!/[A-Z]/.test(password)) {
    throw new Error('Password must contain uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    throw new Error('Password must contain lowercase letter');
  }
  if (!/[0-9]/.test(password)) {
    throw new Error('Password must contain number');
  }
}

function validateName(name: string): void {
  if (name.length < 2 || name.length > 100) {
    throw new Error('Name must be 2-100 characters');
  }
  if (/[<>]/.test(name)) {
    throw new Error('Name contains invalid characters');
  }
}

function validateRollNumber(rollNumber: string): void {
  if (rollNumber.length === 0 || rollNumber.length > 50) {
    throw new Error('Roll number must be 1-50 characters');
  }
  if (!/^[A-Z0-9-]+$/i.test(rollNumber)) {
    throw new Error('Roll number must be alphanumeric with hyphens');
  }
}

function validateStudent(student: any): void {
  if (!student.email || !student.password || !student.name || !student.rollNumber) {
    throw new Error('Missing required fields');
  }
  validateEmail(student.email);
  validatePassword(student.password);
  validateName(student.name);
  validateRollNumber(student.rollNumber);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    // Check if user is admin
    const { data: roles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);

    const userRoles = roles?.map(r => r.role) || [];
    if (!userRoles.includes('admin')) {
      throw new Error('Only admins can bulk import students');
    }

    const { students } = await req.json();

    if (!students || !Array.isArray(students)) {
      throw new Error('Students must be an array');
    }

    if (students.length === 0) {
      throw new Error('Students array cannot be empty');
    }

    if (students.length > 100) {
      throw new Error('Maximum 100 students per batch');
    }

    const results = [];
    const errors = [];

    for (const student of students) {
      try {
        // Validate each student
        validateStudent(student);

        const { email, password, name, rollNumber, classId } = student;

        // Create auth user
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email,
          password,
          email_confirm: false,
          user_metadata: { name }
        });

        if (authError) {
          errors.push({ email, error: authError.message });
          continue;
        }

        const userId = authData.user.id;

        // Assign student role
        await supabase
          .from('user_roles')
          .insert({ user_id: userId, role: 'student' });

        // Create student record
        await supabase
          .from('students')
          .insert({
            id: userId,
            name,
            email,
            roll_number: rollNumber,
            class_id: classId || null,
            teacher_id: null,
          });

        results.push({ email, userId, success: true });

        // Send verification email (non-blocking)
        fetch(`${supabaseUrl}/functions/v1/send-verification-email`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseServiceKey}`
          },
          body: JSON.stringify({
            email,
            userId,
            name,
            redirectUrl: 'https://your-app.com'
          })
        }).catch(console.error);

      } catch (error: any) {
        errors.push({ email: student.email, error: error.message });
      }
    }

    // Log the action
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: 'bulk_import_students',
      resource_type: 'student',
      details: { 
        total: students.length, 
        success: results.length, 
        failed: errors.length 
      }
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Imported ${results.length} students. ${errors.length} failed.`,
        results,
        errors
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error: any) {
    console.error('Error bulk importing students:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});
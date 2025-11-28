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
    throw new Error('Password must be at least 8 characters long');
  }
  if (!/[A-Z]/.test(password)) {
    throw new Error('Password must contain at least one uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    throw new Error('Password must contain at least one lowercase letter');
  }
  if (!/[0-9]/.test(password)) {
    throw new Error('Password must contain at least one number');
  }
}

function validateName(name: string): void {
  if (name.length < 2) {
    throw new Error('Name must be at least 2 characters long');
  }
  if (name.length > 100) {
    throw new Error('Name must be less than 100 characters');
  }
  // Remove dangerous characters
  if (/[<>]/.test(name)) {
    throw new Error('Name contains invalid characters');
  }
}

function validateRollNumber(rollNumber: string): void {
  if (rollNumber.length === 0) {
    throw new Error('Roll number is required');
  }
  if (rollNumber.length > 50) {
    throw new Error('Roll number must be less than 50 characters');
  }
  if (!/^[A-Z0-9-]+$/i.test(rollNumber)) {
    throw new Error('Roll number must contain only letters, numbers, and hyphens');
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { 
      email, 
      password, 
      name, 
      rollNumber, 
      classId, 
      guardianId,
      redirectUrl 
    } = await req.json();

    // Enhanced validation
    if (!email || !password || !name || !rollNumber) {
      throw new Error('Email, password, name, and roll number are required');
    }

    validateEmail(email);
    validatePassword(password);
    validateName(name);
    validateRollNumber(rollNumber);

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: false,
      user_metadata: { name }
    });

    if (authError) {
      throw authError;
    }

    const userId = authData.user.id;

    // Assign student role
    const { error: roleError } = await supabase
      .from('user_roles')
      .insert({ user_id: userId, role: 'student' });

    if (roleError) {
      // Rollback: delete auth user
      await supabase.auth.admin.deleteUser(userId);
      throw roleError;
    }

    // Create student record
    const { error: studentError } = await supabase
      .from('students')
      .insert({
        id: userId,
        name,
        email,
        roll_number: rollNumber,
        class_id: classId || null,
        guardian_id: guardianId || null,
        teacher_id: null, // Will be assigned by admin/teacher
      });

    if (studentError) {
      // Rollback
      await supabase.auth.admin.deleteUser(userId);
      throw studentError;
    }

    // Send verification email
    try {
      await fetch(`${supabaseUrl}/functions/v1/send-verification-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseServiceKey}`
        },
        body: JSON.stringify({
          email,
          userId,
          name,
          redirectUrl
        })
      });
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      // Don't rollback registration if email fails
    }

    // Log the action
    await supabase.from('audit_logs').insert({
      user_id: userId,
      action: 'student_registered',
      resource_type: 'student',
      resource_id: userId,
      details: { email, name, rollNumber }
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Student registered successfully. Please check email for verification link.',
        userId 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error: any) {
    console.error('Error registering student:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});
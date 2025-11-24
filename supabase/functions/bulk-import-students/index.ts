import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

    if (!students || !Array.isArray(students) || students.length === 0) {
      throw new Error('Students array is required');
    }

    const results = [];
    const errors = [];

    for (const student of students) {
      try {
        const { email, password, name, rollNumber, classId } = student;

        if (!email || !password || !name || !rollNumber) {
          errors.push({ email, error: 'Missing required fields' });
          continue;
        }

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
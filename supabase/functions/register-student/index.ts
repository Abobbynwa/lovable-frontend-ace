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

    // Validation
    if (!email || !password || !name || !rollNumber) {
      throw new Error('Email, password, name, and roll number are required');
    }

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
  } catch (error) {
    console.error('Error registering student:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});
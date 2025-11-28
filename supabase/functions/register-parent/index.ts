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
  if (/[<>]/.test(name)) {
    throw new Error('Name contains invalid characters');
  }
}

function validatePhone(phone: string | null): void {
  if (!phone) return; // Phone is optional
  
  // Remove spaces, dashes, and parentheses for validation
  const cleanPhone = phone.replace(/[\s\-()]/g, '');
  
  // Check if it starts with + or is all digits
  if (!/^\+?[0-9]{10,15}$/.test(cleanPhone)) {
    throw new Error('Invalid phone number format. Must be 10-15 digits, optionally starting with +');
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
      phone,
      studentIds, // Array of student IDs to link
      redirectUrl 
    } = await req.json();

    // Enhanced validation
    if (!email || !password || !name) {
      throw new Error('Email, password, and name are required');
    }

    validateEmail(email);
    validatePassword(password);
    validateName(name);
    validatePhone(phone);

    // Validate studentIds if provided
    if (studentIds && !Array.isArray(studentIds)) {
      throw new Error('studentIds must be an array');
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

    // Assign parent role
    const { error: roleError } = await supabase
      .from('user_roles')
      .insert({ user_id: userId, role: 'parent' });

    if (roleError) {
      await supabase.auth.admin.deleteUser(userId);
      throw roleError;
    }

    // Create guardian record
    const { data: guardianData, error: guardianError } = await supabase
      .from('guardians')
      .insert({
        user_id: userId,
        name,
        email,
        phone: phone || null,
      })
      .select()
      .single();

    if (guardianError) {
      await supabase.auth.admin.deleteUser(userId);
      throw guardianError;
    }

    // Link students to guardian
    if (studentIds && studentIds.length > 0) {
      const guardianLinks = studentIds.map((studentId: string) => ({
        student_id: studentId,
        guardian_id: guardianData.id,
        relationship: 'parent'
      }));

      const { error: linkError } = await supabase
        .from('student_guardians')
        .insert(guardianLinks);

      if (linkError) {
        console.error('Failed to link students:', linkError);
        // Don't rollback, can be linked later
      }
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
    }

    // Log the action
    await supabase.from('audit_logs').insert({
      user_id: userId,
      action: 'parent_registered',
      resource_type: 'guardian',
      resource_id: guardianData.id,
      details: { email, name, studentIds }
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Parent registered successfully. Please check email for verification link.',
        userId,
        guardianId: guardianData.id
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error: any) {
    console.error('Error registering parent:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});
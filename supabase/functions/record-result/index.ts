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

    // Check if user is teacher or admin
    const { data: roles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);

    const userRoles = roles?.map(r => r.role) || [];
    if (!userRoles.includes('teacher') && !userRoles.includes('admin')) {
      throw new Error('Only teachers and admins can record results');
    }

    const { studentId, subject, score } = await req.json();

    if (!studentId || !subject || score === undefined) {
      throw new Error('Student ID, subject, and score are required');
    }

    if (score < 0 || score > 100) {
      throw new Error('Score must be between 0 and 100');
    }

    // Server-side grade calculation
    let grade = 'F';
    if (score >= 90) grade = 'A+';
    else if (score >= 80) grade = 'A';
    else if (score >= 70) grade = 'B';
    else if (score >= 60) grade = 'C';
    else if (score >= 50) grade = 'D';

    // Insert or update result
    const { data, error } = await supabase
      .from('results')
      .upsert({
        student_id: studentId,
        subject,
        score,
        grade,
        teacher_id: user.id,
        recorded_by: user.id,
      }, {
        onConflict: 'student_id,subject',
        ignoreDuplicates: false
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Log the action
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: 'result_recorded',
      resource_type: 'result',
      resource_id: data.id,
      details: { studentId, subject, score, grade }
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Result recorded successfully',
        data 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error: any) {
    console.error('Error recording result:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});
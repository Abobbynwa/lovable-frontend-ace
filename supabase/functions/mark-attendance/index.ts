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

    // Get current user
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
      throw new Error('Only teachers and admins can mark attendance');
    }

    const { records, date } = await req.json();

    if (!records || !Array.isArray(records) || records.length === 0) {
      throw new Error('Attendance records array is required');
    }

    if (!date) {
      throw new Error('Date is required');
    }

    // Prepare attendance records
    const attendanceRecords = records.map((record: any) => ({
      student_id: record.studentId,
      date,
      status: record.status,
      teacher_id: user.id,
      recorded_by: user.id,
    }));

    // Upsert attendance (update if exists for same student + date, insert if not)
    const { data, error } = await supabase
      .from('attendance')
      .upsert(attendanceRecords, {
        onConflict: 'student_id,date',
        ignoreDuplicates: false
      })
      .select();

    if (error) {
      throw error;
    }

    // Log the action
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: 'attendance_marked',
      resource_type: 'attendance',
      details: { date, count: records.length }
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Attendance marked for ${records.length} students`,
        data 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    console.error('Error marking attendance:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});
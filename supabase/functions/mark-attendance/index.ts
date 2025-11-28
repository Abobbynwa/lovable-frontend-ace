import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Validation functions
function validateDate(date: string): void {
  // Check if date is in valid format (YYYY-MM-DD)
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) {
    throw new Error('Date must be in YYYY-MM-DD format');
  }
  
  const parsedDate = new Date(date);
  if (isNaN(parsedDate.getTime())) {
    throw new Error('Invalid date');
  }
  
  // Date shouldn't be too far in the future
  const maxFutureDate = new Date();
  maxFutureDate.setDate(maxFutureDate.getDate() + 30);
  if (parsedDate > maxFutureDate) {
    throw new Error('Date cannot be more than 30 days in the future');
  }
}

function validateAttendanceStatus(status: string): void {
  const validStatuses = ['present', 'absent', 'late', 'excused'];
  if (!validStatuses.includes(status.toLowerCase())) {
    throw new Error(`Status must be one of: ${validStatuses.join(', ')}`);
  }
}

function validateAttendanceRecord(record: any): void {
  if (!record.studentId || typeof record.studentId !== 'string') {
    throw new Error('Each record must have a valid studentId');
  }
  if (!record.status || typeof record.status !== 'string') {
    throw new Error('Each record must have a valid status');
  }
  validateAttendanceStatus(record.status);
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

    // Enhanced validation
    if (!records || !Array.isArray(records)) {
      throw new Error('Attendance records must be an array');
    }

    if (records.length === 0) {
      throw new Error('Attendance records array cannot be empty');
    }

    if (records.length > 200) {
      throw new Error('Maximum 200 attendance records per request');
    }

    if (!date) {
      throw new Error('Date is required');
    }

    validateDate(date);

    // Validate each record
    for (const record of records) {
      validateAttendanceRecord(record);
    }

    // Prepare attendance records
    const attendanceRecords = records.map((record: any) => ({
      student_id: record.studentId,
      date,
      status: record.status.toLowerCase(),
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
  } catch (error: any) {
    console.error('Error marking attendance:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});
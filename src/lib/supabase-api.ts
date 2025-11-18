import { supabase } from '@/integrations/supabase/client';

// Dashboard APIs
export const getStats = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Get total students
  const { count: totalStudents } = await supabase
    .from('students')
    .select('*', { count: 'exact', head: true })
    .eq('teacher_id', user.id);

  // Get today's attendance
  const today = new Date().toISOString().split('T')[0];
  const { count: presentToday } = await supabase
    .from('attendance')
    .select('*', { count: 'exact', head: true })
    .eq('teacher_id', user.id)
    .eq('date', today)
    .eq('status', 'present');

  // Calculate average attendance (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const { data: recentAttendance } = await supabase
    .from('attendance')
    .select('status')
    .eq('teacher_id', user.id)
    .gte('date', thirtyDaysAgo.toISOString().split('T')[0]);

  const totalRecords = recentAttendance?.length || 0;
  const presentRecords = recentAttendance?.filter(a => a.status === 'present').length || 0;
  const averageAttendance = totalRecords > 0 ? Math.round((presentRecords / totalRecords) * 100) : 0;

  // Get recent updates (results updated in last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const { count: recentUpdates } = await supabase
    .from('results')
    .select('*', { count: 'exact', head: true })
    .eq('teacher_id', user.id)
    .gte('updated_at', sevenDaysAgo.toISOString());

  return {
    totalStudents: totalStudents || 0,
    presentToday: presentToday || 0,
    averageAttendance,
    recentUpdates: recentUpdates || 0,
  };
};

// Students APIs
export const getStudents = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('students')
    .select(`
      *,
      class:classes(id, name)
    `)
    .eq('teacher_id', user.id)
    .order('roll_number');

  if (error) throw error;
  return data;
};

export const getStudentById = async (id: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data: student, error: studentError } = await supabase
    .from('students')
    .select(`
      *,
      class:classes(id, name)
    `)
    .eq('id', id)
    .eq('teacher_id', user.id)
    .single();

  if (studentError) throw studentError;

  // Get attendance records
  const { data: attendance, error: attendanceError } = await supabase
    .from('attendance')
    .select('*')
    .eq('student_id', id)
    .eq('teacher_id', user.id)
    .order('date', { ascending: false })
    .limit(30);

  if (attendanceError) throw attendanceError;

  // Get results
  const { data: results, error: resultsError } = await supabase
    .from('results')
    .select('*')
    .eq('student_id', id)
    .eq('teacher_id', user.id);

  if (resultsError) throw resultsError;

  return {
    ...student,
    attendance: attendance || [],
    results: results || [],
  };
};

// Attendance APIs
export const recordAttendance = async (attendanceData: {
  date: string;
  records: Array<{ studentId: string; status: 'present' | 'absent' }>;
}) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const records = attendanceData.records.map(record => ({
    student_id: record.studentId,
    date: attendanceData.date,
    status: record.status,
    teacher_id: user.id,
  }));

  const { error } = await supabase
    .from('attendance')
    .upsert(records, { onConflict: 'student_id,date' });

  if (error) throw error;
  return { success: true };
};

// Results APIs
export const updateResults = async (resultsData: {
  results: Array<{
    studentId: string;
    results: Array<{ subject: string; score: number }>;
  }>;
}) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const allResults = resultsData.results.flatMap(studentData =>
    studentData.results.map(result => ({
      student_id: studentData.studentId,
      subject: result.subject,
      score: result.score,
      teacher_id: user.id,
    }))
  );

  const { error } = await supabase
    .from('results')
    .upsert(allResults, { onConflict: 'student_id,subject' });

  if (error) throw error;
  return { success: true };
};

// Teacher APIs
export const getTeacherProfile = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) throw error;
  return data;
};

export const updateTeacherProfile = async (profileData: { name: string }) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('profiles')
    .update({ name: profileData.name })
    .eq('id', user.id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

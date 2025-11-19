import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import { User, Calendar, Award, Bell } from 'lucide-react';

interface Student {
  id: string;
  name: string;
  roll_number: string;
  class_name: string;
}

export default function ParentDashboard() {
  const { user, hasRole, loading } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (user && hasRole('parent')) {
      fetchStudents();
      fetchNotifications();
    }
  }, [user, hasRole]);

  const fetchStudents = async () => {
    try {
      const { data: guardianData } = await supabase
        .from('guardians')
        .select('id')
        .eq('user_id', user?.id)
        .single();

      if (guardianData) {
        const { data: studentLinks } = await supabase
          .from('student_guardians')
          .select('student_id')
          .eq('guardian_id', guardianData.id);

        if (studentLinks) {
          const studentIds = studentLinks.map(link => link.student_id);
          const { data: studentsData } = await supabase
            .from('students')
            .select(`
              id,
              name,
              roll_number,
              classes:class_id(name)
            `)
            .in('id', studentIds);

          setStudents(studentsData?.map(s => ({
            ...s,
            class_name: s.classes?.name || 'Not assigned'
          })) || []);
        }
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user?.id)
        .eq('read', false)
        .order('created_at', { ascending: false })
        .limit(5);

      setNotifications(data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!hasRole('parent')) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Parent Portal</h1>
        <p className="text-muted-foreground">Monitor your children's progress</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">My Children</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{students.length}</div>
            <p className="text-xs text-muted-foreground">Linked students</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Notifications</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{notifications.length}</div>
            <p className="text-xs text-muted-foreground">Unread messages</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Children</CardTitle>
        </CardHeader>
        <CardContent>
          {students.length === 0 ? (
            <p className="text-muted-foreground">No students linked to your account.</p>
          ) : (
            <div className="space-y-4">
              {students.map(student => (
                <Link
                  key={student.id}
                  to={`/parent/student/${student.id}`}
                  className="block p-4 border rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{student.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        Roll No: {student.roll_number} | Class: {student.class_name}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Calendar className="h-5 w-5 text-muted-foreground" />
                      <Award className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
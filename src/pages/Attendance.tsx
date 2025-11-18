import { useEffect, useState } from 'react';
import { Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getStudents, recordAttendance } from '@/lib/api';
import ErrorAlert from '@/components/ErrorAlert';
import { TableSkeleton } from '@/components/LoadingSkeleton';
import { toast } from 'sonner';

interface Student {
  id: string;
  name: string;
  rollNumber: string;
}

interface AttendanceRecord {
  studentId: string;
  status: 'present' | 'absent';
}

const Attendance = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<Record<string, 'present' | 'absent'>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      const data = await getStudents();
      setStudents(data);
      
      // Initialize all as present by default
      const initialAttendance: Record<string, 'present' | 'absent'> = {};
      data.forEach((student: Student) => {
        initialAttendance[student.id] = 'present';
      });
      setAttendance(initialAttendance);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const handleAttendanceChange = (studentId: string, status: 'present' | 'absent') => {
    setAttendance((prev) => ({
      ...prev,
      [studentId]: status,
    }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError('');

    try {
      const attendanceRecords: AttendanceRecord[] = Object.entries(attendance).map(
        ([studentId, status]) => ({
          studentId,
          status,
        })
      );

      await recordAttendance({
        date: new Date().toISOString().split('T')[0],
        records: attendanceRecords,
      });

      toast.success('Attendance recorded successfully!');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to record attendance');
      toast.error('Failed to record attendance');
    } finally {
      setSubmitting(false);
    }
  };

  const presentCount = Object.values(attendance).filter((status) => status === 'present').length;
  const absentCount = students.length - presentCount;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground">Take Attendance</h2>
        <p className="text-muted-foreground mt-1">
          Record attendance for {new Date().toLocaleDateString()}
        </p>
      </div>

      {error && <ErrorAlert message={error} />}

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Students</CardDescription>
            <CardTitle className="text-3xl">{students.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Present</CardDescription>
            <CardTitle className="text-3xl text-success">{presentCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Absent</CardDescription>
            <CardTitle className="text-3xl text-destructive">{absentCount}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Mark Attendance
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <TableSkeleton />
          ) : (
            <div className="space-y-4">
              <div className="rounded-md border">
                <div className="grid grid-cols-3 gap-4 p-4 font-semibold border-b">
                  <div>Roll Number</div>
                  <div>Student Name</div>
                  <div>Status</div>
                </div>
                {students.map((student) => (
                  <div
                    key={student.id}
                    className="grid grid-cols-3 gap-4 p-4 border-b last:border-0 items-center"
                  >
                    <div className="font-medium">{student.rollNumber}</div>
                    <div>{student.name}</div>
                    <div>
                      <Select
                        value={attendance[student.id]}
                        onValueChange={(value: 'present' | 'absent') =>
                          handleAttendanceChange(student.id, value)
                        }
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="present">Present</SelectItem>
                          <SelectItem value="absent">Absent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSubmit} disabled={submitting} size="lg">
                  {submitting ? 'Submitting...' : 'Submit Attendance'}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Attendance;

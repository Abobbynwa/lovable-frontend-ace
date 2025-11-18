import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, User, BookOpen, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getStudentById } from '@/lib/api';
import ErrorAlert from '@/components/ErrorAlert';
import { ProfileSkeleton } from '@/components/LoadingSkeleton';

interface StudentData {
  id: string;
  name: string;
  email: string;
  grade: string;
  rollNumber: string;
  attendanceHistory: Array<{ date: string; status: string }>;
  results: Array<{ subject: string; score: number; grade: string }>;
}

const StudentProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState<StudentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      loadStudent();
    }
  }, [id]);

  const loadStudent = async () => {
    try {
      const data = await getStudentById(id!);
      setStudent(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load student profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => navigate('/students')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Students
        </Button>
        <ProfileSkeleton />
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => navigate('/students')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Students
        </Button>
        <ErrorAlert message={error || 'Student not found'} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => navigate('/students')}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Students
      </Button>

      <div>
        <h2 className="text-3xl font-bold text-foreground">{student.name}</h2>
        <p className="text-muted-foreground mt-1">Student Profile</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Roll Number</p>
              <p className="font-semibold">{student.rollNumber}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-semibold flex items-center gap-2">
                <Mail className="h-4 w-4" />
                {student.email}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Grade</p>
              <p className="font-semibold">{student.grade}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Academic Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {student.results?.slice(0, 3).map((result, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-sm">{result.subject}</span>
                  <span className="font-semibold">{result.score}% ({result.grade})</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Attendance History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {student.attendanceHistory?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center text-muted-foreground">
                      No attendance records found
                    </TableCell>
                  </TableRow>
                ) : (
                  student.attendanceHistory?.map((record, index) => (
                    <TableRow key={index}>
                      <TableCell>{record.date}</TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            record.status === 'Present'
                              ? 'bg-success/10 text-success'
                              : 'bg-destructive/10 text-destructive'
                          }`}
                        >
                          {record.status}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Complete Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subject</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Grade</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {student.results?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground">
                      No results available
                    </TableCell>
                  </TableRow>
                ) : (
                  student.results?.map((result, index) => (
                    <TableRow key={index}>
                      <TableCell>{result.subject}</TableCell>
                      <TableCell>{result.score}%</TableCell>
                      <TableCell>
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                          {result.grade}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentProfile;

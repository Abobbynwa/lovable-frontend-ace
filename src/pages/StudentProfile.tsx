import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getStudentById } from '@/lib/supabase-api';
import ErrorAlert from '@/components/ErrorAlert';
import { ProfileSkeleton } from '@/components/LoadingSkeleton';

const StudentProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) loadStudent();
  }, [id]);

  const loadStudent = async () => {
    try {
      const data = await getStudentById(id!);
      setStudent(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load student');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <ProfileSkeleton />;
  if (error || !student) return <ErrorAlert message={error || 'Student not found'} />;

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => navigate('/students')}><ArrowLeft className="h-4 w-4 mr-2" />Back</Button>
      <h2 className="text-3xl font-bold">{student.name}</h2>
      <Card>
        <CardHeader><CardTitle>Details</CardTitle></CardHeader>
        <CardContent>
          <p>Roll: {student.roll_number}</p>
          <p>Email: {student.email || 'N/A'}</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentProfile;

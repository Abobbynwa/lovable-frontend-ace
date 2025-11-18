import { useEffect, useState } from 'react';
import { FileText, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { getStudents, updateResults } from '@/lib/supabase-api';
import ErrorAlert from '@/components/ErrorAlert';
import { TableSkeleton } from '@/components/LoadingSkeleton';
import { toast } from 'sonner';

interface Student {
  id: string;
  name: string;
  roll_number: string;
}

const subjects = ['Mathematics', 'Science', 'English', 'History', 'Geography'];

const Results = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [scores, setScores] = useState<Record<string, Record<string, string>>>({});
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
      
      // Initialize empty scores
      const initialScores: Record<string, Record<string, string>> = {};
      data.forEach((student: Student) => {
        initialScores[student.id] = {};
        subjects.forEach((subject) => {
          initialScores[student.id][subject] = '';
        });
      });
      setScores(initialScores);
    } catch (err: any) {
      setError(err.message || 'Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const handleScoreChange = (studentId: string, subject: string, value: string) => {
    // Only allow numbers 0-100
    if (value === '' || (/^\d+$/.test(value) && parseInt(value) <= 100)) {
      setScores((prev) => ({
        ...prev,
        [studentId]: {
          ...prev[studentId],
          [subject]: value,
        },
      }));
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError('');

    try {
      const resultsData = Object.entries(scores).map(([studentId, subjects]) => ({
        studentId,
        results: Object.entries(subjects).map(([subject, score]) => ({
          subject,
          score: score === '' ? 0 : parseInt(score),
        })),
      }));

      await updateResults({ results: resultsData });
      toast.success('Results updated successfully!');
    } catch (err: any) {
      setError(err.message || 'Failed to update results');
      toast.error('Failed to update results');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground">Enter Results</h2>
        <p className="text-muted-foreground mt-1">Update student scores and grades</p>
      </div>

      {error && <ErrorAlert message={error} />}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Student Results
          </CardTitle>
          <CardDescription>Enter scores out of 100 for each subject</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <TableSkeleton />
          ) : (
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <div className="min-w-[800px]">
                  <div className="grid gap-4 p-4 font-semibold border rounded-t-lg bg-muted" style={{
                    gridTemplateColumns: `150px 200px repeat(${subjects.length}, 1fr)`
                  }}>
                    <div>Roll Number</div>
                    <div>Student Name</div>
                    {subjects.map((subject) => (
                      <div key={subject}>{subject}</div>
                    ))}
                  </div>
                  
                  <div className="border border-t-0 rounded-b-lg">
                    {students.map((student, index) => (
                      <div
                        key={student.id}
                        className={`grid gap-4 p-4 items-center ${
                          index !== students.length - 1 ? 'border-b' : ''
                        }`}
                        style={{
                          gridTemplateColumns: `150px 200px repeat(${subjects.length}, 1fr)`
                        }}
                      >
                        <div className="font-medium">{student.roll_number}</div>
                        <div>{student.name}</div>
                        {subjects.map((subject) => (
                          <div key={subject}>
                            <Input
                              type="text"
                              placeholder="0-100"
                              value={scores[student.id]?.[subject] || ''}
                              onChange={(e) =>
                                handleScoreChange(student.id, subject, e.target.value)
                              }
                              className="w-20"
                            />
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button onClick={handleSubmit} disabled={submitting} size="lg">
                  <Save className="h-4 w-4 mr-2" />
                  {submitting ? 'Saving...' : 'Save Results'}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Results;

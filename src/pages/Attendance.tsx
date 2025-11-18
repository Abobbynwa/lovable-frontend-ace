import { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getStudents, recordAttendance } from '@/lib/supabase-api';
import { toast } from 'sonner';

const Attendance = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      const data = await getStudents();
      setStudents(data);
      const init: Record<string, string> = {};
      data.forEach((s: any) => init[s.id] = 'present');
      setAttendance(init);
    } catch (err) {
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const records = Object.entries(attendance).map(([studentId, status]) => ({ studentId, status: status as any }));
      await recordAttendance({ date: new Date().toISOString().split('T')[0], records });
      toast.success('Attendance saved!');
    } catch (err) {
      toast.error('Failed to save');
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold">Take Attendance</h2>
      <Card>
        <CardHeader><CardTitle>Mark Attendance</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {students.map((s) => (
            <div key={s.id} className="flex justify-between items-center p-4 border rounded">
              <span>{s.name}</span>
              <Select value={attendance[s.id]} onValueChange={(v) => setAttendance({...attendance, [s.id]: v})}>
                <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="present">Present</SelectItem>
                  <SelectItem value="absent">Absent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          ))}
          <Button onClick={handleSubmit} className="w-full"><Save className="h-4 w-4 mr-2" />Save</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Attendance;

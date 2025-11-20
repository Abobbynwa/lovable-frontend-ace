import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/admin/DataTable';
import { StudentModal } from '@/components/admin/StudentModal';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Plus, Upload } from 'lucide-react';

export default function StudentsManagement() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('students')
      .select('*, classes(name)')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Failed to load students');
    } else {
      setStudents(data || []);
    }
    setLoading(false);
  };

  const handleDelete = async (student: any) => {
    if (!confirm('Are you sure you want to delete this student?')) return;

    const { error } = await supabase.from('students').delete().eq('id', student.id);

    if (error) {
      toast.error('Failed to delete student');
    } else {
      toast.success('Student deleted successfully');
      loadStudents();
    }
  };

  const columns = [
    { key: 'name', header: 'Name' },
    { key: 'roll_number', header: 'Roll Number' },
    { key: 'email', header: 'Email' },
    {
      key: 'classes',
      header: 'Class',
      render: (student: any) => student.classes?.name || 'Not assigned',
    },
    { key: 'guardian_name', header: 'Guardian' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Students Management</h2>
          <p className="text-muted-foreground">Manage student records and enrollments</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Import CSV
          </Button>
          <Button onClick={() => { setSelectedStudent(null); setModalOpen(true); }}>
            <Plus className="h-4 w-4 mr-2" />
            Add Student
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Students ({students.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : (
            <DataTable
              data={students}
              columns={columns}
              onEdit={(student) => { setSelectedStudent(student); setModalOpen(true); }}
              onDelete={handleDelete}
            />
          )}
        </CardContent>
      </Card>

      <StudentModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={loadStudents}
        student={selectedStudent}
      />
    </div>
  );
}

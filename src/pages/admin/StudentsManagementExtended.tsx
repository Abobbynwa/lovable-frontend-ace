import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Pencil, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Student {
  id: string;
  name: string;
  email: string | null;
  roll_number: string;
  class_id: string | null;
  age: number | null;
  blood_type: string | null;
  genotype: string | null;
  blood_group: string | null;
  state_of_origin: string | null;
  class_teacher_name: string | null;
  town: string | null;
  parent_name: string | null;
  parent_email: string | null;
  parent_phone: string | null;
}

const StudentsManagementExtended = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    roll_number: '',
    class_id: '',
    age: '',
    blood_type: '',
    genotype: '',
    blood_group: '',
    state_of_origin: '',
    class_teacher_name: '',
    town: '',
    parent_name: '',
    parent_email: '',
    parent_phone: ''
  });

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .order('name');
    
    if (error) {
      toast({ title: 'Error', description: 'Failed to load students', variant: 'destructive' });
    } else {
      setStudents(data || []);
    }
    setLoading(false);
  };

  const handleEdit = (student: Student) => {
    setSelectedStudent(student);
    setFormData({
      name: student.name,
      email: student.email || '',
      roll_number: student.roll_number,
      class_id: student.class_id || '',
      age: student.age?.toString() || '',
      blood_type: student.blood_type || '',
      genotype: student.genotype || '',
      blood_group: student.blood_group || '',
      state_of_origin: student.state_of_origin || '',
      class_teacher_name: student.class_teacher_name || '',
      town: student.town || '',
      parent_name: student.parent_name || '',
      parent_email: student.parent_email || '',
      parent_phone: student.parent_phone || ''
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const studentData = {
      name: formData.name,
      email: formData.email || null,
      roll_number: formData.roll_number,
      class_id: formData.class_id || null,
      age: formData.age ? parseInt(formData.age) : null,
      blood_type: formData.blood_type || null,
      genotype: formData.genotype || null,
      blood_group: formData.blood_group || null,
      state_of_origin: formData.state_of_origin || null,
      class_teacher_name: formData.class_teacher_name || null,
      town: formData.town || null,
      parent_name: formData.parent_name || null,
      parent_email: formData.parent_email || null,
      parent_phone: formData.parent_phone || null
    };

    if (selectedStudent) {
      const { error } = await supabase
        .from('students')
        .update(studentData)
        .eq('id', selectedStudent.id);

      if (error) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: 'Success', description: 'Student updated successfully' });
        setModalOpen(false);
        loadStudents();
      }
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Student Extended Profiles</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : (
            <div className="space-y-4">
              {students.map((student) => (
                <div key={student.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-semibold">{student.name}</h3>
                    <p className="text-sm text-muted-foreground">Roll: {student.roll_number}</p>
                    <p className="text-sm">Age: {student.age || 'N/A'} | Town: {student.town || 'N/A'}</p>
                  </div>
                  <Button variant="outline" size="icon" onClick={() => handleEdit(student)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Student Extended Profile</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Name</Label>
                <Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
              </div>
              <div>
                <Label>Email</Label>
                <Input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
              </div>
              <div>
                <Label>Roll Number</Label>
                <Input value={formData.roll_number} onChange={(e) => setFormData({...formData, roll_number: e.target.value})} required />
              </div>
              <div>
                <Label>Age</Label>
                <Input type="number" value={formData.age} onChange={(e) => setFormData({...formData, age: e.target.value})} />
              </div>
              <div>
                <Label>Blood Type</Label>
                <Input value={formData.blood_type} onChange={(e) => setFormData({...formData, blood_type: e.target.value})} />
              </div>
              <div>
                <Label>Genotype</Label>
                <Input value={formData.genotype} onChange={(e) => setFormData({...formData, genotype: e.target.value})} />
              </div>
              <div>
                <Label>Blood Group</Label>
                <Input value={formData.blood_group} onChange={(e) => setFormData({...formData, blood_group: e.target.value})} />
              </div>
              <div>
                <Label>State of Origin</Label>
                <Input value={formData.state_of_origin} onChange={(e) => setFormData({...formData, state_of_origin: e.target.value})} />
              </div>
              <div>
                <Label>Class Teacher Name</Label>
                <Input value={formData.class_teacher_name} onChange={(e) => setFormData({...formData, class_teacher_name: e.target.value})} />
              </div>
              <div>
                <Label>Town</Label>
                <Input value={formData.town} onChange={(e) => setFormData({...formData, town: e.target.value})} />
              </div>
              <div className="col-span-2">
                <h3 className="font-semibold mb-2">Parent Information</h3>
              </div>
              <div>
                <Label>Parent Name</Label>
                <Input value={formData.parent_name} onChange={(e) => setFormData({...formData, parent_name: e.target.value})} />
              </div>
              <div>
                <Label>Parent Email</Label>
                <Input type="email" value={formData.parent_email} onChange={(e) => setFormData({...formData, parent_email: e.target.value})} />
              </div>
              <div>
                <Label>Parent Phone</Label>
                <Input value={formData.parent_phone} onChange={(e) => setFormData({...formData, parent_phone: e.target.value})} />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button type="submit">Save Changes</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudentsManagementExtended;

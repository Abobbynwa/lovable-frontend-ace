import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface StudentModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  student?: any;
}

export function StudentModal({ open, onClose, onSuccess, student }: StudentModalProps) {
  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    rollNumber: '',
    classId: '',
    guardianName: '',
    guardianPhone: '',
    age: '',
    bloodType: '',
    genotype: '',
    bloodGroup: '',
    stateOfOrigin: '',
    classTeacherName: '',
    town: '',
    parentName: '',
    parentEmail: '',
    parentPhone: '',
  });

  useEffect(() => {
    if (open) {
      loadClasses();
      if (student) {
        setFormData({
          name: student.name,
          email: student.email || '',
          rollNumber: student.roll_number,
          classId: student.class_id || '',
          guardianName: student.guardian_name || '',
          guardianPhone: student.guardian_phone || '',
          age: student.age?.toString() || '',
          bloodType: student.blood_type || '',
          genotype: student.genotype || '',
          bloodGroup: student.blood_group || '',
          stateOfOrigin: student.state_of_origin || '',
          classTeacherName: student.class_teacher_name || '',
          town: student.town || '',
          parentName: student.parent_name || '',
          parentEmail: student.parent_email || '',
          parentPhone: student.parent_phone || '',
        });
      } else {
        setFormData({
          name: '',
          email: '',
          rollNumber: '',
          classId: '',
          guardianName: '',
          guardianPhone: '',
          age: '',
          bloodType: '',
          genotype: '',
          bloodGroup: '',
          stateOfOrigin: '',
          classTeacherName: '',
          town: '',
          parentName: '',
          parentEmail: '',
          parentPhone: '',
        });
      }
    }
  }, [open, student]);

  const loadClasses = async () => {
    const { data } = await supabase.from('classes').select('*');
    setClasses(data || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (student) {
        // Update existing student
        const { error } = await supabase
          .from('students')
          .update({
            name: formData.name,
            email: formData.email,
            roll_number: formData.rollNumber,
            class_id: formData.classId || null,
            guardian_name: formData.guardianName,
            guardian_phone: formData.guardianPhone,
            age: formData.age ? parseInt(formData.age) : null,
            blood_type: formData.bloodType || null,
            genotype: formData.genotype || null,
            blood_group: formData.bloodGroup || null,
            state_of_origin: formData.stateOfOrigin || null,
            class_teacher_name: formData.classTeacherName || null,
            town: formData.town || null,
            parent_name: formData.parentName || null,
            parent_email: formData.parentEmail || null,
            parent_phone: formData.parentPhone || null,
          })
          .eq('id', student.id);

        if (error) throw error;
        toast.success('Student updated successfully');
      } else {
        // Register new student via edge function
        const { error } = await supabase.functions.invoke('register-student', {
          body: {
            name: formData.name,
            email: formData.email,
            rollNumber: formData.rollNumber,
            password: 'Student@123', // Default password
            classId: formData.classId || null,
            guardianName: formData.guardianName,
            guardianPhone: formData.guardianPhone,
          },
        });

        if (error) throw error;
        toast.success('Student registered successfully');
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save student');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{student ? 'Edit Student Extended Profile' : 'Add New Student'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="rollNumber">Roll Number *</Label>
              <Input
                id="rollNumber"
                value={formData.rollNumber}
                onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                type="number"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="classId">Class</Label>
              <Select value={formData.classId} onValueChange={(value) => setFormData({ ...formData, classId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id}>
                      {cls.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="classTeacherName">Class Teacher Name</Label>
              <Input
                id="classTeacherName"
                value={formData.classTeacherName}
                onChange={(e) => setFormData({ ...formData, classTeacherName: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="bloodType">Blood Type</Label>
              <Input
                id="bloodType"
                placeholder="e.g., O+, A-, B+"
                value={formData.bloodType}
                onChange={(e) => setFormData({ ...formData, bloodType: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="genotype">Genotype</Label>
              <Input
                id="genotype"
                placeholder="e.g., AA, AS, SS"
                value={formData.genotype}
                onChange={(e) => setFormData({ ...formData, genotype: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="bloodGroup">Blood Group</Label>
              <Input
                id="bloodGroup"
                placeholder="e.g., A, B, AB, O"
                value={formData.bloodGroup}
                onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="stateOfOrigin">State of Origin</Label>
              <Input
                id="stateOfOrigin"
                value={formData.stateOfOrigin}
                onChange={(e) => setFormData({ ...formData, stateOfOrigin: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="town">Town</Label>
              <Input
                id="town"
                value={formData.town}
                onChange={(e) => setFormData({ ...formData, town: e.target.value })}
              />
            </div>

            <div className="col-span-2">
              <h3 className="text-lg font-semibold mb-2 mt-4">Parent/Guardian Information</h3>
            </div>

            <div>
              <Label htmlFor="guardianName">Guardian Name</Label>
              <Input
                id="guardianName"
                value={formData.guardianName}
                onChange={(e) => setFormData({ ...formData, guardianName: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="guardianPhone">Guardian Phone</Label>
              <Input
                id="guardianPhone"
                value={formData.guardianPhone}
                onChange={(e) => setFormData({ ...formData, guardianPhone: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="parentName">Parent Name</Label>
              <Input
                id="parentName"
                value={formData.parentName}
                onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="parentEmail">Parent Email</Label>
              <Input
                id="parentEmail"
                type="email"
                value={formData.parentEmail}
                onChange={(e) => setFormData({ ...formData, parentEmail: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="parentPhone">Parent Phone</Label>
              <Input
                id="parentPhone"
                value={formData.parentPhone}
                onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

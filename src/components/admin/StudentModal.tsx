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
        });
      } else {
        setFormData({
          name: '',
          email: '',
          rollNumber: '',
          classId: '',
          guardianName: '',
          guardianPhone: '',
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
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{student ? 'Edit Student' : 'Add New Student'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
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

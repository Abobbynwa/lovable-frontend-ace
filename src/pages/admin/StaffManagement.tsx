import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Pencil, Trash2, Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Staff {
  id: string;
  name: string;
  email: string;
  class_taught: string | null;
  rank: string | null;
  staff_type: string | null;
  gender: string | null;
  state_of_origin: string | null;
  hobbies: string | null;
  resident_address: string | null;
  status: string | null;
  age: number | null;
  account_number: string | null;
  bank_name: string | null;
}

const StaffManagement = () => {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    class_taught: '',
    rank: '',
    staff_type: '',
    gender: '',
    state_of_origin: '',
    hobbies: '',
    resident_address: '',
    status: 'active',
    age: '',
    account_number: '',
    bank_name: ''
  });

  useEffect(() => {
    loadStaff();
  }, []);

  const loadStaff = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('staff').select('*').order('name');
    
    if (error) {
      toast({ title: 'Error', description: 'Failed to load staff', variant: 'destructive' });
    } else {
      setStaff(data || []);
    }
    setLoading(false);
  };

  const handleEdit = (staffMember: Staff) => {
    setSelectedStaff(staffMember);
    setFormData({
      name: staffMember.name,
      email: staffMember.email,
      class_taught: staffMember.class_taught || '',
      rank: staffMember.rank || '',
      staff_type: staffMember.staff_type || '',
      gender: staffMember.gender || '',
      state_of_origin: staffMember.state_of_origin || '',
      hobbies: staffMember.hobbies || '',
      resident_address: staffMember.resident_address || '',
      status: staffMember.status || 'active',
      age: staffMember.age?.toString() || '',
      account_number: staffMember.account_number || '',
      bank_name: staffMember.bank_name || ''
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const staffData = {
      name: formData.name,
      email: formData.email,
      class_taught: formData.class_taught || null,
      rank: formData.rank || null,
      staff_type: formData.staff_type || null,
      gender: formData.gender || null,
      state_of_origin: formData.state_of_origin || null,
      hobbies: formData.hobbies || null,
      resident_address: formData.resident_address || null,
      status: formData.status || null,
      age: formData.age ? parseInt(formData.age) : null,
      account_number: formData.account_number || null,
      bank_name: formData.bank_name || null
    };

    if (selectedStaff) {
      const { error } = await supabase
        .from('staff')
        .update(staffData)
        .eq('id', selectedStaff.id);

      if (error) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: 'Success', description: 'Staff updated successfully' });
        setModalOpen(false);
        loadStaff();
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this staff member?')) return;

    const { error } = await supabase.from('staff').delete().eq('id', id);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Staff deleted successfully' });
      loadStaff();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Staff Management</h2>
          <p className="text-muted-foreground">Manage staff members and their details</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Staff Members</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : (
            <div className="space-y-4">
              {staff.map((staffMember) => (
                <div key={staffMember.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-semibold">{staffMember.name}</h3>
                    <p className="text-sm text-muted-foreground">{staffMember.email}</p>
                    <p className="text-sm">{staffMember.class_taught || 'No class assigned'} | {staffMember.rank || 'No rank'}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon" onClick={() => handleEdit(staffMember)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="destructive" size="icon" onClick={() => handleDelete(staffMember.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Staff Details</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Name</Label>
                <Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
              </div>
              <div>
                <Label>Email</Label>
                <Input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required />
              </div>
              <div>
                <Label>Class Taught</Label>
                <Input value={formData.class_taught} onChange={(e) => setFormData({...formData, class_taught: e.target.value})} />
              </div>
              <div>
                <Label>Rank</Label>
                <Input value={formData.rank} onChange={(e) => setFormData({...formData, rank: e.target.value})} />
              </div>
              <div>
                <Label>Staff Type</Label>
                <Select value={formData.staff_type} onValueChange={(value) => setFormData({...formData, staff_type: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="teaching_staff">Teaching Staff</SelectItem>
                    <SelectItem value="non_teaching_staff">Non-Teaching Staff</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Gender</Label>
                <Select value={formData.gender} onValueChange={(value) => setFormData({...formData, gender: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Age</Label>
                <Input type="number" value={formData.age} onChange={(e) => setFormData({...formData, age: e.target.value})} />
              </div>
              <div>
                <Label>State of Origin</Label>
                <Input value={formData.state_of_origin} onChange={(e) => setFormData({...formData, state_of_origin: e.target.value})} />
              </div>
              <div>
                <Label>Status</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="on_leave">On Leave</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Account Number</Label>
                <Input value={formData.account_number} onChange={(e) => setFormData({...formData, account_number: e.target.value})} />
              </div>
              <div>
                <Label>Bank Name</Label>
                <Input value={formData.bank_name} onChange={(e) => setFormData({...formData, bank_name: e.target.value})} />
              </div>
              <div className="col-span-2">
                <Label>Resident Address</Label>
                <Input value={formData.resident_address} onChange={(e) => setFormData({...formData, resident_address: e.target.value})} />
              </div>
              <div className="col-span-2">
                <Label>Hobbies</Label>
                <Input value={formData.hobbies} onChange={(e) => setFormData({...formData, hobbies: e.target.value})} />
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

export default StaffManagement;

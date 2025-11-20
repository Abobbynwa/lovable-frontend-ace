import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/admin/DataTable';
import { ClassModal } from '@/components/admin/ClassModal';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';

export default function ClassesManagement() {
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<any>(null);

  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('classes')
      .select('*, profiles(name)')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Failed to load classes');
    } else {
      setClasses(data || []);
    }
    setLoading(false);
  };

  const handleDelete = async (classData: any) => {
    if (!confirm('Are you sure you want to delete this class?')) return;

    const { error } = await supabase.from('classes').delete().eq('id', classData.id);

    if (error) {
      toast.error('Failed to delete class');
    } else {
      toast.success('Class deleted successfully');
      loadClasses();
    }
  };

  const columns = [
    { key: 'name', header: 'Class Name' },
    {
      key: 'profiles',
      header: 'Form Teacher',
      render: (cls: any) => cls.profiles?.name || 'Not assigned',
    },
    {
      key: 'created_at',
      header: 'Created',
      render: (cls: any) => new Date(cls.created_at).toLocaleDateString(),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Classes Management</h2>
          <p className="text-muted-foreground">Manage classes and teacher assignments</p>
        </div>
        <Button onClick={() => { setSelectedClass(null); setModalOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          Add Class
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Classes ({classes.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : (
            <DataTable
              data={classes}
              columns={columns}
              onEdit={(cls) => { setSelectedClass(cls); setModalOpen(true); }}
              onDelete={handleDelete}
            />
          )}
        </CardContent>
      </Card>

      <ClassModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={loadClasses}
        classData={selectedClass}
      />
    </div>
  );
}

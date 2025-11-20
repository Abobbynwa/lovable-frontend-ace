import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DataTable } from '@/components/admin/DataTable';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Plus, Megaphone } from 'lucide-react';

export default function AnnouncementsManagement() {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    body: '',
    audience: 'all',
  });

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const loadAnnouncements = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('announcements')
      .select('*, profiles(name)')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Failed to load announcements');
    } else {
      setAnnouncements(data || []);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { error } = await supabase.from('announcements').insert({
      title: formData.title,
      body: formData.body,
      audience: formData.audience,
      created_by: user?.id,
    });

    if (error) {
      toast.error('Failed to create announcement');
    } else {
      toast.success('Announcement created successfully');
      setFormData({ title: '', body: '', audience: 'all' });
      setShowForm(false);
      loadAnnouncements();
    }
  };

  const handleDelete = async (announcement: any) => {
    if (!confirm('Are you sure you want to delete this announcement?')) return;

    const { error } = await supabase.from('announcements').delete().eq('id', announcement.id);

    if (error) {
      toast.error('Failed to delete announcement');
    } else {
      toast.success('Announcement deleted successfully');
      loadAnnouncements();
    }
  };

  const columns = [
    { key: 'title', header: 'Title' },
    { key: 'audience', header: 'Audience', render: (a: any) => a.audience.toUpperCase() },
    {
      key: 'profiles',
      header: 'Created By',
      render: (a: any) => a.profiles?.name || 'Unknown',
    },
    {
      key: 'created_at',
      header: 'Date',
      render: (a: any) => new Date(a.created_at).toLocaleDateString(),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Announcements</h2>
          <p className="text-muted-foreground">Communicate with students, parents, and teachers</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-2" />
          New Announcement
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Megaphone className="h-5 w-5" />
              Create Announcement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="body">Message *</Label>
                <Textarea
                  id="body"
                  value={formData.body}
                  onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                  rows={4}
                  required
                />
              </div>

              <div>
                <Label htmlFor="audience">Audience *</Label>
                <Select
                  value={formData.audience}
                  onValueChange={(value) => setFormData({ ...formData, audience: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Everyone</SelectItem>
                    <SelectItem value="students">Students Only</SelectItem>
                    <SelectItem value="parents">Parents Only</SelectItem>
                    <SelectItem value="teachers">Teachers Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Button type="submit">Publish Announcement</Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>All Announcements ({announcements.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : (
            <DataTable data={announcements} columns={columns} onDelete={handleDelete} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

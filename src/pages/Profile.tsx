import { useEffect, useState } from 'react';
import { User, Mail, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getTeacherProfile, updateTeacherProfile } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import ErrorAlert from '@/components/ErrorAlert';
import { ProfileSkeleton } from '@/components/LoadingSkeleton';
import { toast } from 'sonner';

const Profile = () => {
  const { teacher, setTeacher } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await getTeacherProfile();
      setName(data.name);
      setEmail(data.email);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const updatedProfile = await updateTeacherProfile({ name });
      setTeacher(updatedProfile);
      toast.success('Profile updated successfully!');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update profile');
      toast.error('Failed to update profile');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-foreground">My Profile</h2>
          <p className="text-muted-foreground mt-1">Manage your account information</p>
        </div>
        <ProfileSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground">My Profile</h2>
        <p className="text-muted-foreground mt-1">Manage your account information</p>
      </div>

      {error && <ErrorAlert message={error} />}

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Personal Information
            </CardTitle>
            <CardDescription>Update your personal details</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    value={email}
                    disabled
                    className="pl-10 bg-muted"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Email cannot be changed
                </p>
              </div>

              <Button type="submit" disabled={submitting}>
                <Save className="h-4 w-4 mr-2" />
                {submitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account Statistics</CardTitle>
            <CardDescription>Your activity overview</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg">
              <span className="text-sm font-medium">Account Status</span>
              <span className="px-3 py-1 bg-success text-success-foreground rounded-full text-xs font-medium">
                Active
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <span className="text-sm font-medium">Email Verified</span>
              <span className="px-3 py-1 bg-success text-success-foreground rounded-full text-xs font-medium">
                Yes
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <span className="text-sm font-medium">Member Since</span>
              <span className="text-sm font-semibold">
                {new Date().toLocaleDateString()}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;

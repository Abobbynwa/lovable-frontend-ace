import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { GraduationCap, Users, BookOpen, BarChart3 } from 'lucide-react';

const Index = () => {
  const { user, userRoles, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      // Redirect authenticated users to their appropriate dashboard
      if (userRoles.includes('admin')) {
        navigate('/admin');
      } else if (userRoles.includes('parent')) {
        navigate('/parent');
      } else if (userRoles.includes('student')) {
        navigate('/student');
      } else if (userRoles.includes('staff') || userRoles.includes('teacher')) {
        navigate('/dashboard');
      } else {
        navigate('/dashboard');
      }
    }
  }, [user, userRoles, loading, navigate]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">SchoolMS</h1>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate('/admin-login')}>
              Admin
            </Button>
            <Button variant="ghost" size="sm" onClick={() => navigate('/staff-login')}>
              Staff
            </Button>
            <Button variant="ghost" size="sm" onClick={() => navigate('/student-login')}>
              Student
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
            School Management
            <span className="block text-primary">Made Simple</span>
          </h1>
          <p className="text-xl text-muted-foreground">
            A comprehensive platform for managing students, attendance, results, and communication between teachers, parents, and students.
          </p>
          <div className="flex flex-wrap gap-3 justify-center pt-4">
            <Button size="lg" onClick={() => navigate('/admin-login')}>
              Admin Login
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/staff-login')}>
              Staff Login
            </Button>
            <Button size="lg" variant="secondary" onClick={() => navigate('/student-login')}>
              Student Login
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Users className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">Student Management</h3>
            <p className="text-muted-foreground">
              Efficiently manage student records, enrollment, and class assignments
            </p>
          </div>

          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <BookOpen className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">Attendance Tracking</h3>
            <p className="text-muted-foreground">
              Real-time attendance marking and comprehensive reporting
            </p>
          </div>

          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <BarChart3 className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">Results & Analytics</h3>
            <p className="text-muted-foreground">
              Track academic performance with detailed result management
            </p>
          </div>

          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <GraduationCap className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">Parent Portal</h3>
            <p className="text-muted-foreground">
              Keep parents informed with real-time updates and announcements
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t mt-20">
        <div className="container mx-auto px-4 py-8 text-center text-muted-foreground">
          <p>&copy; 2025 SchoolMS. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;

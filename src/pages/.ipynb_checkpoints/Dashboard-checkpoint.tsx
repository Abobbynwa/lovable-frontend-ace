import { useEffect, useState } from 'react';
import { Users, Calendar, TrendingUp, BookOpen } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getStats } from '@/lib/supabase-api';
import { useAuth } from '@/contexts/AuthContext';
import ErrorAlert from '@/components/ErrorAlert';
import { CardSkeleton } from '@/components/LoadingSkeleton';

interface Stats {
  totalStudents: number;
  presentToday: number;
  averageAttendance: number;
  recentUpdates: number;
}

const Dashboard = () => {
  const { teacher } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await getStats();
      setStats(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Students',
      value: stats?.totalStudents || 0,
      icon: Users,
      color: 'text-primary',
    },
    {
      title: 'Present Today',
      value: stats?.presentToday || 0,
      icon: Calendar,
      color: 'text-success',
    },
    {
      title: 'Avg. Attendance',
      value: `${stats?.averageAttendance || 0}%`,
      icon: TrendingUp,
      color: 'text-accent',
    },
    {
      title: 'Recent Updates',
      value: stats?.recentUpdates || 0,
      icon: BookOpen,
      color: 'text-warning',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground">
          Welcome back, {teacher?.name}!
        </h2>
        <p className="text-muted-foreground mt-1">
          Here's what's happening with your classes today
        </p>
      </div>

      {error && <ErrorAlert message={error} />}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {loading ? (
          <>
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </>
        ) : (
          statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-foreground">{stat.value}</div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <a href="/students" className="p-4 border rounded-lg hover:bg-muted transition-colors">
              <Users className="h-6 w-6 mb-2 text-primary" />
              <h3 className="font-semibold">View Students</h3>
              <p className="text-sm text-muted-foreground">Manage your student list</p>
            </a>
            <a href="/attendance" className="p-4 border rounded-lg hover:bg-muted transition-colors">
              <Calendar className="h-6 w-6 mb-2 text-success" />
              <h3 className="font-semibold">Take Attendance</h3>
              <p className="text-sm text-muted-foreground">Record today's attendance</p>
            </a>
            <a href="/results" className="p-4 border rounded-lg hover:bg-muted transition-colors">
              <BookOpen className="h-6 w-6 mb-2 text-accent" />
              <h3 className="font-semibold">Enter Results</h3>
              <p className="text-sm text-muted-foreground">Update student scores</p>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;

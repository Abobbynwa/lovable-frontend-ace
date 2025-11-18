import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  FileText, 
  User, 
  LogOut,
  X
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface SidebarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Users, label: 'Students', path: '/students' },
  { icon: Calendar, label: 'Attendance', path: '/attendance' },
  { icon: FileText, label: 'Results', path: '/results' },
  { icon: User, label: 'Profile', path: '/profile' },
];

const Sidebar = ({ open, setOpen }: SidebarProps) => {
  const location = useLocation();
  const { logout, teacher } = useAuth();

  return (
    <>
      {/* Overlay */}
      {open && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-screen w-64 bg-card border-r border-border transition-transform duration-300 lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <h2 className="text-xl font-bold text-primary">EduPortal</h2>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Teacher Info */}
          <div className="p-4 border-b border-border">
            <p className="text-sm text-muted-foreground">Welcome back,</p>
            <p className="font-semibold text-foreground">{teacher?.name || 'Teacher'}</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-all",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-border">
            <Button
              variant="outline"
              className="w-full justify-start gap-3"
              onClick={() => {
                logout();
                window.location.href = '/send-code';
              }}
            >
              <LogOut className="h-5 w-5" />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

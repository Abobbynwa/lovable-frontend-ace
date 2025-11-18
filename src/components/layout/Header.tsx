import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  toggleSidebar: () => void;
}

const Header = ({ toggleSidebar }: HeaderProps) => {
  return (
    <header className="sticky top-0 z-30 bg-card border-b border-border">
      <div className="flex items-center justify-between px-4 md:px-6 h-16">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={toggleSidebar}
        >
          <Menu className="h-5 w-5" />
        </Button>
        
        <div className="flex-1 lg:ml-0 ml-4">
          <h1 className="text-lg font-semibold text-foreground">School Management Portal</h1>
        </div>
      </div>
    </header>
  );
};

export default Header;

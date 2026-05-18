import { ReactNode } from 'react';
import { Bell, Menu } from 'lucide-react';
import { Link } from 'react-router';

interface FlowLayoutProps {
  children: ReactNode;
  projectName?: string;
}

export function FlowLayout({ children, projectName }: FlowLayoutProps) {
  return (
    <div className="min-h-screen bg-canvas">
      {/* Minimal Top Bar */}
      <div className="fixed top-0 left-0 right-0 h-16 bg-card/80 backdrop-blur-sm border-b border-border z-50">
        <div className="container max-w-7xl mx-auto h-full px-6 flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center gap-4">
            <Link to="/loop" className="text-lg font-bold bg-gradient-to-l from-primary to-[#3b82f6] bg-clip-text text-transparent">
              Nexus
            </Link>

            {projectName && (
              <>
                <div className="w-px h-6 bg-border" />
                <span className="text-sm text-muted-foreground">{projectName}</span>
              </>
            )}
          </div>

          {/* Minimal Actions */}
          <div className="flex items-center gap-3">
            <Link
              to="/notifications"
              className="relative p-2 rounded-lg hover:bg-muted transition-colors"
            >
              <Bell className="w-5 h-5 text-foreground" />
              <span className="absolute top-1.5 left-1.5 w-2 h-2 bg-destructive rounded-full" />
            </Link>

            <Link
              to="/home"
              className="p-2 rounded-lg hover:bg-muted transition-colors"
              title="תפריט"
            >
              <Menu className="w-5 h-5 text-foreground" />
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="pt-16 min-h-screen">
        {children}
      </main>
    </div>
  );
}

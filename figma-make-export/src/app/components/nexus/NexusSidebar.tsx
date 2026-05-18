import { Home, Plus, MessageSquare, CheckCircle, Repeat, Clock, FolderOpen, Code, Brain, Rocket, TrendingUp, Plug, Settings, HelpCircle } from 'lucide-react';
import { Link, useLocation } from 'react-router';

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  section?: 'primary' | 'support' | 'advanced' | 'settings';
}

const navItems: NavItem[] = [
  { title: 'יצירה', href: '/create', icon: Plus, section: 'primary' },
  { title: 'הבנה', href: '/onboarding', icon: MessageSquare, section: 'primary' },
  { title: 'לולאה', href: '/loop', icon: Repeat, section: 'primary' },
  { title: 'ציר זמן', href: '/timeline', icon: Clock, section: 'primary' },
  { title: 'בית', href: '/home', icon: Home, section: 'support' },
  { title: 'קבצים', href: '/files', icon: FolderOpen, section: 'support' },
  { title: 'Developer', href: '/developer', icon: Code, section: 'advanced' },
  { title: 'מוח הפרויקט', href: '/brain', icon: Brain, section: 'advanced' },
  { title: 'שחרורים', href: '/release', icon: Rocket, section: 'advanced' },
  { title: 'צמיחה', href: '/growth', icon: TrendingUp, section: 'advanced' },
  { title: 'אינטגרציות', href: '/integrations', icon: Plug, section: 'support' },
];

const settingsItems: NavItem[] = [
  { title: 'הגדרות', href: '/settings', icon: Settings },
  { title: 'עזרה', href: '/help', icon: HelpCircle },
];

export function NexusSidebar() {
  const location = useLocation();

  const isActive = (href: string) => {
    if (href === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(href);
  };

  return (
    <div className="fixed left-0 top-0 h-screen w-64 bg-sidebar border-l border-sidebar-border flex flex-col">
      {/* Logo */}
      <div className="h-16 flex items-center justify-end px-6 border-b border-sidebar-border">
        <div className="text-xl font-bold bg-gradient-to-l from-primary to-[#3b82f6] bg-clip-text text-transparent">
          Nexus
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-6 px-3">
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                to={item.href}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors
                  ${active
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
                  }
                `}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm font-medium">{item.title}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Settings section */}
      <div className="border-t border-sidebar-border p-3">
        <nav className="space-y-1">
          {settingsItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                to={item.href}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors
                  ${active
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
                  }
                `}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm font-medium">{item.title}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

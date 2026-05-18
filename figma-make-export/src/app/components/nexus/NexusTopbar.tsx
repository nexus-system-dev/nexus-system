import { Bell, ChevronDown } from 'lucide-react';
import { Link } from 'react-router';

interface NexusTopbarProps {
  showProjectSelector?: boolean;
  projectName?: string;
}

export function NexusTopbar({ showProjectSelector = false, projectName }: NexusTopbarProps) {
  return (
    <div className="h-16 bg-card border-b border-border flex items-center justify-between px-6">
      {/* Brand */}
      <div className="flex items-center gap-4">
        <div className="text-lg font-bold bg-gradient-to-l from-primary to-[#3b82f6] bg-clip-text text-transparent">
          Nexus
        </div>

        {showProjectSelector && projectName && (
          <>
            <div className="w-px h-6 bg-border" />
            <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-muted transition-colors">
              <span className="text-sm font-medium text-foreground">{projectName}</span>
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </button>
          </>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <Link
          to="/notifications"
          className="relative p-2 rounded-lg hover:bg-muted transition-colors"
        >
          <Bell className="w-5 h-5 text-foreground" />
          <span className="absolute top-1.5 left-1.5 w-2 h-2 bg-destructive rounded-full" />
        </Link>

        <div className="w-px h-6 bg-border" />

        <button className="flex items-center gap-2 hover:bg-muted rounded-lg px-2 py-1 transition-colors">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-[#3b82f6] flex items-center justify-center">
            <span className="text-xs font-semibold text-white">AB</span>
          </div>
        </button>
      </div>
    </div>
  );
}

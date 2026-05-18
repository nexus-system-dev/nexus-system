import { ReactNode } from 'react';
import { NexusCard } from './NexusCard';
import { Target, Clock, CheckCircle2 } from 'lucide-react';

interface NexusTaskCardProps {
  title: string;
  description: string;
  status?: 'pending' | 'active' | 'complete';
  priority?: 'low' | 'medium' | 'high';
  metadata?: {
    label: string;
    value: string;
  }[];
  actions?: ReactNode;
  icon?: ReactNode;
}

export function NexusTaskCard({
  title,
  description,
  status = 'pending',
  priority = 'medium',
  metadata,
  actions,
  icon,
}: NexusTaskCardProps) {
  const statusConfig = {
    pending: { color: 'text-muted-foreground', bg: 'bg-muted', label: 'ממתין' },
    active: { color: 'text-primary', bg: 'bg-primary/10', label: 'פעיל' },
    complete: { color: 'text-success', bg: 'bg-success/10', label: 'הושלם' },
  };

  const priorityConfig = {
    low: { color: 'text-muted-foreground', label: 'נמוך' },
    medium: { color: 'text-warning', label: 'בינוני' },
    high: { color: 'text-destructive', label: 'גבוה' },
  };

  const currentStatus = statusConfig[status];
  const currentPriority = priorityConfig[priority];

  return (
    <NexusCard hover className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4 flex-1">
          {icon ? (
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              {icon}
            </div>
          ) : (
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Target className="w-6 h-6 text-primary" />
            </div>
          )}

          <div className="flex-1 space-y-2">
            <h3 className="text-lg font-semibold text-foreground">{title}</h3>
            <p className="text-muted-foreground">{description}</p>
          </div>
        </div>

        <div className="flex flex-col gap-2 items-end">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${currentStatus.bg} ${currentStatus.color}`}>
            {currentStatus.label}
          </span>
          <span className={`text-xs font-medium ${currentPriority.color}`}>
            עדיפות: {currentPriority.label}
          </span>
        </div>
      </div>

      {metadata && metadata.length > 0 && (
        <div className="flex gap-6 pt-4 border-t border-border">
          {metadata.map((item, index) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">{item.label}:</span>
              <span className="font-medium text-foreground">{item.value}</span>
            </div>
          ))}
        </div>
      )}

      {actions && (
        <div className="flex gap-3 pt-4 border-t border-border">
          {actions}
        </div>
      )}
    </NexusCard>
  );
}

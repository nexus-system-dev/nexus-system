import { ReactNode } from 'react';
import { Loader2, AlertCircle, CheckCircle2, Inbox } from 'lucide-react';
import { NexusCard } from './NexusCard';
import { NexusButton } from './NexusButton';

interface StateProps {
  title?: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  children?: ReactNode;
}

export function EmptyState({ title, description, action, children }: StateProps) {
  return (
    <NexusCard className="max-w-md mx-auto text-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
          <Inbox className="w-8 h-8 text-muted-foreground" />
        </div>
        {title && <h3 className="text-xl font-semibold">{title}</h3>}
        {description && <p className="text-muted-foreground">{description}</p>}
        {children}
        {action && (
          <NexusButton onClick={action.onClick} className="mt-2">
            {action.label}
          </NexusButton>
        )}
      </div>
    </NexusCard>
  );
}

export function LoadingState({ title = 'טוען...', description }: StateProps) {
  return (
    <NexusCard className="max-w-md mx-auto text-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <h3 className="text-xl font-semibold">{title}</h3>
        {description && <p className="text-muted-foreground">{description}</p>}
      </div>
    </NexusCard>
  );
}

export function SuccessState({ title, description, action, children }: StateProps) {
  return (
    <NexusCard className="max-w-md mx-auto text-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center">
          <CheckCircle2 className="w-8 h-8 text-success" />
        </div>
        {title && <h3 className="text-xl font-semibold">{title}</h3>}
        {description && <p className="text-muted-foreground">{description}</p>}
        {children}
        {action && (
          <NexusButton onClick={action.onClick} className="mt-2">
            {action.label}
          </NexusButton>
        )}
      </div>
    </NexusCard>
  );
}

export function ErrorState({ title = 'משהו השתבש', description, action }: StateProps) {
  return (
    <NexusCard className="max-w-md mx-auto text-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-destructive" />
        </div>
        <h3 className="text-xl font-semibold">{title}</h3>
        {description && <p className="text-muted-foreground">{description}</p>}
        {action && (
          <NexusButton onClick={action.onClick} variant="secondary" className="mt-2">
            {action.label}
          </NexusButton>
        )}
      </div>
    </NexusCard>
  );
}

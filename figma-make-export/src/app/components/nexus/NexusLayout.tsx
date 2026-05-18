import { ReactNode } from 'react';
import { NexusSidebar } from './NexusSidebar';
import { NexusTopbar } from './NexusTopbar';

interface NexusLayoutProps {
  children: ReactNode;
  showProjectSelector?: boolean;
  projectName?: string;
}

export function NexusLayout({ children, showProjectSelector, projectName }: NexusLayoutProps) {
  return (
    <div className="min-h-screen bg-canvas">
      <NexusSidebar />

      <div className="mr-64">
        <NexusTopbar showProjectSelector={showProjectSelector} projectName={projectName} />

        <main className="min-h-[calc(100vh-4rem)]">
          {children}
        </main>
      </div>
    </div>
  );
}

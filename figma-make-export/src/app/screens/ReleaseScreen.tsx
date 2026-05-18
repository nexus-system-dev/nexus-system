import { Rocket, GitBranch, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { NexusLayout } from '../components/nexus/NexusLayout';
import { NexusCard } from '../components/nexus/NexusCard';
import { NexusButton } from '../components/nexus/NexusButton';

interface Release {
  id: string;
  version: string;
  status: 'deployed' | 'ready' | 'in-progress' | 'failed';
  environment: 'production' | 'staging' | 'development';
  deployedAt?: string;
  branch: string;
}

export function ReleaseScreen() {
  const releases: Release[] = [
    {
      id: '1',
      version: 'v1.2.0',
      status: 'deployed',
      environment: 'production',
      deployedAt: 'לפני 2 שעות',
      branch: 'main',
    },
    {
      id: '2',
      version: 'v1.3.0-beta',
      status: 'ready',
      environment: 'staging',
      branch: 'develop',
    },
    {
      id: '3',
      version: 'v1.1.5',
      status: 'deployed',
      environment: 'production',
      deployedAt: 'לפני שבוע',
      branch: 'main',
    },
  ];

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'deployed':
        return { label: 'פעיל', color: 'bg-success/10 text-success', icon: <CheckCircle2 className="w-4 h-4" /> };
      case 'ready':
        return { label: 'מוכן', color: 'bg-primary/10 text-primary', icon: <Rocket className="w-4 h-4" /> };
      case 'in-progress':
        return { label: 'בתהליך', color: 'bg-warning/10 text-warning', icon: <Clock className="w-4 h-4" /> };
      default:
        return { label: 'נכשל', color: 'bg-destructive/10 text-destructive', icon: <AlertCircle className="w-4 h-4" /> };
    }
  };

  return (
    <NexusLayout showProjectSelector projectName="אפליקציית מסחר אלקטרוני">
      <div className="container max-w-5xl mx-auto p-8 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Rocket className="w-10 h-10 text-primary" />
              <h1 className="text-4xl font-bold">ניהול גרסאות ושחרורים</h1>
            </div>
            <p className="text-muted-foreground text-lg">
              נהל deployments, גרסאות וסביבות
            </p>
          </div>

          <NexusButton size="lg">
            צור שחרור חדש
          </NexusButton>
        </div>

        {/* Current Production */}
        <NexusCard className="bg-gradient-to-l from-success/5 to-primary/5 border-success/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">גרסה בפרודקשן</p>
                <p className="text-2xl font-bold">v1.2.0</p>
              </div>
            </div>
            <div className="text-left">
              <p className="text-sm text-muted-foreground">פרוסה לפני</p>
              <p className="font-medium">2 שעות</p>
            </div>
          </div>
        </NexusCard>

        {/* Releases List */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">היסטוריית שחרורים</h2>

          {releases.map((release) => {
            const statusConfig = getStatusConfig(release.status);

            return (
              <NexusCard key={release.id} padding="lg" hover>
                <div className="flex items-center justify-between gap-6">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Rocket className="w-5 h-5 text-primary" />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-lg">{release.version}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${statusConfig.color}`}>
                          {statusConfig.icon}
                          {statusConfig.label}
                        </span>
                      </div>

                      <div className="flex gap-4 mt-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <GitBranch className="w-4 h-4" />
                          {release.branch}
                        </span>
                        <span>•</span>
                        <span>{release.environment}</span>
                        {release.deployedAt && (
                          <>
                            <span>•</span>
                            <span>{release.deployedAt}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {release.status === 'ready' && (
                      <NexusButton>
                        פרוס
                      </NexusButton>
                    )}
                    <NexusButton variant="secondary">
                      פרטים
                    </NexusButton>
                  </div>
                </div>
              </NexusCard>
            );
          })}
        </div>

        {/* Deployment Health */}
        <NexusCard>
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">בריאות Deployment</h3>
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center p-4 rounded-lg bg-success/10">
                <div className="text-2xl font-bold text-success">99.9%</div>
                <div className="text-xs text-muted-foreground mt-1">Uptime</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-primary/10">
                <div className="text-2xl font-bold text-primary">12</div>
                <div className="text-xs text-muted-foreground mt-1">Deployments החודש</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-success/10">
                <div className="text-2xl font-bold text-success">0</div>
                <div className="text-xs text-muted-foreground mt-1">Rollbacks</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-primary/10">
                <div className="text-2xl font-bold text-primary">4m</div>
                <div className="text-xs text-muted-foreground mt-1">זמן deployment ממוצע</div>
              </div>
            </div>
          </div>
        </NexusCard>
      </div>
    </NexusLayout>
  );
}

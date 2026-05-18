import { CheckCircle2, Plus } from 'lucide-react';
import { NexusLayout } from '../components/nexus/NexusLayout';
import { NexusCard } from '../components/nexus/NexusCard';
import { NexusButton } from '../components/nexus/NexusButton';

interface Integration {
  id: string;
  name: string;
  description: string;
  connected: boolean;
  logo: string;
}

export function IntegrationsScreen() {
  const integrations: Integration[] = [
    {
      id: '1',
      name: 'GitHub',
      description: 'סנכרון קוד ו-issues אוטומטי',
      connected: true,
      logo: '🔗',
    },
    {
      id: '2',
      name: 'Slack',
      description: 'התראות ועדכונים בזמן אמת',
      connected: true,
      logo: '💬',
    },
    {
      id: '3',
      name: 'Vercel',
      description: 'פריסה אוטומטית של הפרויקט',
      connected: false,
      logo: '▲',
    },
    {
      id: '4',
      name: 'Stripe',
      description: 'מערכת תשלומים',
      connected: false,
      logo: '💳',
    },
  ];

  return (
    <NexusLayout showProjectSelector projectName="אפליקציית מסחר אלקטרוני">
      <div className="container max-w-5xl mx-auto p-8 space-y-8">
        <div>
          <h1 className="text-4xl font-bold">אינטגרציות</h1>
          <p className="text-muted-foreground text-lg mt-2">
            חבר שירותים חיצוניים לפרויקט שלך
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {integrations.map((integration) => (
            <NexusCard key={integration.id} hover padding="lg">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center text-2xl">
                      {integration.logo}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{integration.name}</h3>
                      <p className="text-sm text-muted-foreground">{integration.description}</p>
                    </div>
                  </div>

                  {integration.connected && (
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-success/10">
                      <CheckCircle2 className="w-4 h-4 text-success" />
                      <span className="text-xs font-medium text-success">מחובר</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-2 border-t border-border">
                  {integration.connected ? (
                    <>
                      <NexusButton variant="secondary" className="flex-1">
                        הגדרות
                      </NexusButton>
                      <NexusButton variant="secondary">
                        נתק
                      </NexusButton>
                    </>
                  ) : (
                    <NexusButton className="flex-1">
                      <Plus className="w-4 h-4" />
                      חבר
                    </NexusButton>
                  )}
                </div>
              </div>
            </NexusCard>
          ))}
        </div>
      </div>
    </NexusLayout>
  );
}

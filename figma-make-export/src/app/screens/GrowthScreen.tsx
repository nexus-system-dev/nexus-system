import { TrendingUp, Users, DollarSign, Target, Plus } from 'lucide-react';
import { NexusLayout } from '../components/nexus/NexusLayout';
import { NexusCard } from '../components/nexus/NexusCard';
import { NexusButton } from '../components/nexus/NexusButton';

export function GrowthScreen() {
  const metrics = [
    { label: 'משתמשים פעילים', value: '2,547', change: '+12.3%', trend: 'up' },
    { label: 'המרה', value: '3.8%', change: '+0.5%', trend: 'up' },
    { label: 'הכנסה חודשית', value: '$12,450', change: '+23.1%', trend: 'up' },
    { label: 'Churn Rate', value: '2.1%', change: '-0.3%', trend: 'down' },
  ];

  const experiments = [
    {
      id: '1',
      name: 'כפתור CTA חדש',
      status: 'running',
      improvement: '+15%',
      variant: 'A/B Test',
    },
    {
      id: '2',
      name: 'מחיר חדש',
      status: 'completed',
      improvement: '+8%',
      variant: 'Multivariate',
    },
  ];

  const channels = [
    { name: 'Google Ads', users: '1,234', conversion: '4.2%', cost: '$2,450' },
    { name: 'Social Media', users: '856', conversion: '3.1%', cost: '$890' },
    { name: 'Organic Search', users: '457', conversion: '5.8%', cost: '$0' },
  ];

  return (
    <NexusLayout showProjectSelector projectName="אפליקציית מסחר אלקטרוני">
      <div className="container max-w-6xl mx-auto p-8 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-10 h-10 text-primary" />
              <h1 className="text-4xl font-bold">צמיחה ושיווק</h1>
            </div>
            <p className="text-muted-foreground text-lg">
              ניסויים, מדדים וניתוח ערוצי רכישה
            </p>
          </div>

          <NexusButton size="lg">
            <Plus className="w-5 h-5" />
            ניסוי חדש
          </NexusButton>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {metrics.map((metric, index) => (
            <NexusCard key={index} padding="lg">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">{metric.label}</p>
                <p className="text-3xl font-bold">{metric.value}</p>
                <div className={`flex items-center gap-1 text-sm font-medium ${
                  metric.trend === 'up' ? 'text-success' : 'text-destructive'
                }`}>
                  <TrendingUp className={`w-4 h-4 ${metric.trend === 'down' ? 'rotate-180' : ''}`} />
                  <span>{metric.change}</span>
                </div>
              </div>
            </NexusCard>
          ))}
        </div>

        {/* Chart Placeholder */}
        <NexusCard>
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">מגמת גדילה</h3>
            <div className="h-64 bg-muted/30 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">גרף מדדי צמיחה - 30 יום אחרונים</p>
              </div>
            </div>
          </div>
        </NexusCard>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Experiments */}
          <NexusCard>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold">ניסויים פעילים</h3>
                <NexusButton variant="tertiary" size="sm">
                  הצג הכל
                </NexusButton>
              </div>

              <div className="space-y-3">
                {experiments.map((experiment) => (
                  <div
                    key={experiment.id}
                    className="p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">{experiment.name}</h4>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            experiment.status === 'running'
                              ? 'bg-primary/10 text-primary'
                              : 'bg-success/10 text-success'
                          }`}>
                            {experiment.status === 'running' ? 'רץ' : 'הושלם'}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{experiment.variant}</p>
                      </div>
                      <div className="text-left">
                        <p className="text-sm text-muted-foreground">שיפור</p>
                        <p className="font-semibold text-success">{experiment.improvement}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </NexusCard>

          {/* Channels */}
          <NexusCard>
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">ערוצי רכישה</h3>

              <div className="space-y-3">
                {channels.map((channel, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-lg bg-muted/30"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">{channel.name}</h4>
                      <span className="text-sm text-muted-foreground">{channel.cost}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">משתמשים</p>
                        <p className="font-medium">{channel.users}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">המרה</p>
                        <p className="font-medium">{channel.conversion}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </NexusCard>
        </div>
      </div>
    </NexusLayout>
  );
}

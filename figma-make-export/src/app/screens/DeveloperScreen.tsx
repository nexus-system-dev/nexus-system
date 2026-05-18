import { Code, Terminal, Database, Key, Webhook, FileJson, Activity, GitBranch } from 'lucide-react';
import { NexusLayout } from '../components/nexus/NexusLayout';
import { NexusCard } from '../components/nexus/NexusCard';
import { NexusButton } from '../components/nexus/NexusButton';

export function DeveloperScreen() {
  const devTools = [
    {
      icon: <Terminal className="w-6 h-6 text-primary" />,
      title: 'API Console',
      description: 'בדוק ונסה API endpoints ישירות מהממשק',
      status: 'active',
      action: 'פתח Console',
    },
    {
      icon: <Key className="w-6 h-6 text-primary" />,
      title: 'API Keys',
      description: 'נהל מפתחות API לאינטגרציות חיצוניות',
      status: 'active',
      action: 'נהל מפתחות',
    },
    {
      icon: <Webhook className="w-6 h-6 text-primary" />,
      title: 'Webhooks',
      description: 'קבל התראות על אירועים בפרויקט',
      status: 'active',
      action: 'הגדר Webhooks',
    },
    {
      icon: <FileJson className="w-6 h-6 text-primary" />,
      title: 'Schema Explorer',
      description: 'צפה ונווט במבנה הנתונים של הפרויקט',
      status: 'active',
      action: 'צפה ב-Schema',
    },
    {
      icon: <Activity className="w-6 h-6 text-primary" />,
      title: 'Logs & Monitoring',
      description: 'מעקב אחר לוגים, שגיאות וביצועים',
      status: 'active',
      action: 'הצג לוגים',
    },
    {
      icon: <GitBranch className="w-6 h-6 text-primary" />,
      title: 'Version Control',
      description: 'ניהול גרסאות והיסטוריה של הפרויקט',
      status: 'active',
      action: 'פתח Git',
    },
  ];

  const recentActivity = [
    { time: 'לפני 5 דקות', event: 'API request to /products endpoint', type: 'api' },
    { time: 'לפני 15 דקות', event: 'Database migration completed', type: 'database' },
    { time: 'לפני שעה', event: 'Webhook triggered: task.completed', type: 'webhook' },
  ];

  return (
    <NexusLayout showProjectSelector projectName="אפליקציית מסחר אלקטרוני">
      <div className="container max-w-6xl mx-auto p-8 space-y-8">
        {/* Header */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Code className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-bold">Developer Tools</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            כלים מתקדמים למפתחים לניהול טכני של הפרויקט
          </p>
        </div>

        {/* Warning Banner */}
        <NexusCard className="bg-warning/5 border-warning/20">
          <div className="flex gap-3">
            <div className="text-2xl">⚙️</div>
            <div>
              <h3 className="font-semibold text-sm">אזור למפתחים</h3>
              <p className="text-xs text-muted-foreground mt-1">
                הכלים כאן מיועדים למשתמשים עם ידע טכני. שינויים כאן יכולים להשפיע על הפרויקט.
              </p>
            </div>
          </div>
        </NexusCard>

        {/* Developer Tools Grid */}
        <div>
          <h2 className="text-2xl font-semibold mb-6">כלי מפתח</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {devTools.map((tool, index) => (
              <NexusCard key={index} hover padding="lg">
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center flex-shrink-0">
                      {tool.icon}
                    </div>
                    <span className="text-xs font-medium text-success px-2 py-1 rounded-full bg-success/10">
                      {tool.status === 'active' ? 'זמין' : 'לא זמין'}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">{tool.title}</h3>
                    <p className="text-sm text-muted-foreground">{tool.description}</p>
                  </div>
                  <NexusButton variant="secondary" size="sm" className="w-full">
                    {tool.action}
                  </NexusButton>
                </div>
              </NexusCard>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-semibold mb-6">פעילות אחרונה</h2>
            <NexusCard>
              <div className="space-y-3">
                {recentActivity.map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 rounded-lg bg-muted/30"
                  >
                    <Activity className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.event}</p>
                      <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                    </div>
                    <span className="text-xs font-medium text-muted-foreground px-2 py-1 rounded-full bg-muted">
                      {activity.type}
                    </span>
                  </div>
                ))}
              </div>
            </NexusCard>
          </div>

          {/* Quick Stats */}
          <div>
            <h2 className="text-2xl font-semibold mb-6">סטטיסטיקות</h2>
            <NexusCard>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">API Requests (24h)</p>
                  <p className="text-2xl font-bold">1,247</p>
                </div>
                <div className="pt-3 border-t border-border">
                  <p className="text-sm text-muted-foreground">Webhooks Active</p>
                  <p className="text-2xl font-bold">3</p>
                </div>
                <div className="pt-3 border-t border-border">
                  <p className="text-sm text-muted-foreground">Database Size</p>
                  <p className="text-2xl font-bold">12.4 MB</p>
                </div>
              </div>
            </NexusCard>
          </div>
        </div>

        {/* Documentation Link */}
        <NexusCard className="bg-gradient-to-br from-primary/5 to-transparent border-primary/20">
          <div className="flex items-center justify-between gap-6">
            <div>
              <h3 className="text-xl font-semibold mb-2">תיעוד API</h3>
              <p className="text-muted-foreground">
                מדריכים מפורטים ודוגמאות קוד לעבודה עם Nexus API
              </p>
            </div>
            <NexusButton variant="secondary" size="lg">
              פתח תיעוד
            </NexusButton>
          </div>
        </NexusCard>
      </div>
    </NexusLayout>
  );
}

import { useNavigate } from 'react-router';
import { Code, Brain, Rocket, TrendingUp, ChevronLeft } from 'lucide-react';
import { NexusLayout } from '../components/nexus/NexusLayout';
import { NexusCard } from '../components/nexus/NexusCard';

export function AdvancedHubScreen() {
  const navigate = useNavigate();

  const advancedAreas = [
    {
      icon: <Code className="w-8 h-8 text-primary" />,
      title: 'Developer Tools',
      description: 'כלים מתקדמים למפתחים: API explorer, debugging, logs ו-webhooks',
      path: '/developer',
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      icon: <Brain className="w-8 h-8 text-primary" />,
      title: 'מוח הפרויקט',
      description: 'תובנות עמוקות, המלצות אסטרטגיות, ניתוח חסמים ושיפור מתמיד',
      path: '/brain',
      gradient: 'from-purple-500 to-pink-500',
    },
    {
      icon: <Rocket className="w-8 h-8 text-primary" />,
      title: 'ניהול שחרורים',
      description: 'ניהול גרסאות, deployment pipelines, rollback אוטומטי וניטור',
      path: '/release',
      gradient: 'from-green-500 to-emerald-500',
    },
    {
      icon: <TrendingUp className="w-8 h-8 text-primary" />,
      title: 'צמיחה ושיווק',
      description: 'ניסויי גרות, מעקב אחר KPIs, ניתוח ערוצי רכישה ו-conversion',
      path: '/growth',
      gradient: 'from-orange-500 to-red-500',
    },
  ];

  return (
    <NexusLayout showProjectSelector projectName="אפליקציית מסחר אלקטרוני">
      <div className="container max-w-5xl mx-auto p-8 space-y-8">
        <div>
          <h1 className="text-4xl font-bold">אזור מתקדם</h1>
          <p className="text-muted-foreground text-lg mt-2">
            כלים וכישורים מתקדמים למשתמשי power
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {advancedAreas.map((area) => (
            <NexusCard
              key={area.path}
              hover
              className="cursor-pointer group"
              padding="xl"
            >
              <div
                onClick={() => navigate(area.path)}
                className="space-y-4"
              >
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                  {area.icon}
                </div>

                <div className="space-y-2">
                  <h3 className="text-2xl font-semibold group-hover:text-primary transition-colors">
                    {area.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {area.description}
                  </p>
                </div>

                <div className="flex items-center gap-2 text-sm font-medium text-primary pt-2">
                  <span>פתח</span>
                  <ChevronLeft className="w-4 h-4 group-hover:translate-x-[-4px] transition-transform" />
                </div>
              </div>
            </NexusCard>
          ))}
        </div>

        <NexusCard padding="md" className="bg-warning/5 border-warning/20">
          <div className="flex gap-3">
            <div className="text-2xl">⚡</div>
            <div className="flex-1">
              <h4 className="font-semibold text-sm">אזור למשתמשים מתקדמים</h4>
              <p className="text-xs text-muted-foreground mt-1">
                הכלים והתכונות כאן מיועדים למשתמשים עם ידע טכני. אם אתה לא בטוח,
                התייעץ עם צוות הפיתוח שלך.
              </p>
            </div>
          </div>
        </NexusCard>
      </div>
    </NexusLayout>
  );
}

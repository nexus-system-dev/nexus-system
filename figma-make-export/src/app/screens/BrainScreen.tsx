import { Brain, Lightbulb, AlertTriangle, TrendingUp, CheckCircle2 } from 'lucide-react';
import { NexusLayout } from '../components/nexus/NexusLayout';
import { NexusCard } from '../components/nexus/NexusCard';
import { NexusButton } from '../components/nexus/NexusButton';

export function BrainScreen() {
  const insights = [
    {
      type: 'recommendation',
      icon: <Lightbulb className="w-5 h-5 text-warning" />,
      title: 'המלצה: הוסף caching layer',
      description: 'מבנה הנתונים שלך יתמוך בכמות גדולה של שאילתות. שקול להוסיף Redis לקשינג כדי לשפר ביצועים.',
      priority: 'high',
    },
    {
      type: 'blocker',
      icon: <AlertTriangle className="w-5 h-5 text-destructive" />,
      title: 'חסם זוהה: חסר תיעוד API',
      description: 'לא נמצא תיעוד מפורט ל-API endpoints. זה יקשה על משתמשים חיצוניים להשתמש במערכת.',
      priority: 'high',
    },
    {
      type: 'opportunity',
      icon: <TrendingUp className="w-5 h-5 text-success" />,
      title: 'הזדמנות: אופטימיזציה של queries',
      description: 'זוהו 3 queries שיכולים להיות מהירים פי 2 עם אינדקסים נוספים.',
      priority: 'medium',
    },
  ];

  const assumptions = [
    'המערכת תתמוך ב-10,000 משתמשים בו-זמנית',
    'ממוצע של 50 מוצרים לחנות',
    'רוב המשתמשים יגיעו ממכשירים ניידים',
  ];

  return (
    <NexusLayout showProjectSelector projectName="אפליקציית מסחר אלקטרוני">
      <div className="container max-w-5xl mx-auto p-8 space-y-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Brain className="w-10 h-10 text-primary" />
            <h1 className="text-4xl font-bold">מוח הפרויקט</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            תובנות, המלצות וניתוח עמוק של הפרויקט שלך
          </p>
        </div>

        {/* Insights */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">תובנות והמלצות</h2>

          {insights.map((insight, index) => (
            <NexusCard key={index} padding="lg">
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-lg ${
                  insight.type === 'recommendation' ? 'bg-warning/10' :
                  insight.type === 'blocker' ? 'bg-destructive/10' :
                  'bg-success/10'
                } flex items-center justify-center flex-shrink-0`}>
                  {insight.icon}
                </div>

                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="font-semibold text-lg">{insight.title}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      insight.priority === 'high' ? 'bg-destructive/10 text-destructive' : 'bg-warning/10 text-warning'
                    }`}>
                      {insight.priority === 'high' ? 'עדיפות גבוהה' : 'עדיפות בינונית'}
                    </span>
                  </div>
                  <p className="text-muted-foreground">{insight.description}</p>
                  <div className="flex gap-2 pt-2">
                    <NexusButton variant="secondary" size="sm">
                      יישם המלצה
                    </NexusButton>
                    <NexusButton variant="tertiary" size="sm">
                      למד עוד
                    </NexusButton>
                  </div>
                </div>
              </div>
            </NexusCard>
          ))}
        </div>

        {/* Assumptions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <NexusCard>
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">הנחות יסוד</h3>
              <div className="space-y-2">
                {assumptions.map((assumption, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-muted-foreground">{assumption}</p>
                  </div>
                ))}
              </div>
            </div>
          </NexusCard>

          <NexusCard>
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">סיכום אסטרטגי</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                הפרויקט נע בכיוון טוב. הארכיטקטורה יציבה והקוד באיכות גבוהה.
                המלצה מרכזית: להתמקד בביצועים ובתיעוד לפני השקה.
              </p>
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border">
                <div>
                  <div className="text-2xl font-bold text-success">94%</div>
                  <div className="text-xs text-muted-foreground">איכות כללית</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">8</div>
                  <div className="text-xs text-muted-foreground">תובנות פעילות</div>
                </div>
              </div>
            </div>
          </NexusCard>
        </div>
      </div>
    </NexusLayout>
  );
}

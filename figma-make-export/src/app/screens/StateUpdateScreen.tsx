import { useNavigate } from 'react-router';
import { CheckCircle2, TrendingUp, Clock, Sparkles, Zap } from 'lucide-react';
import { FlowLayout } from '../components/nexus/FlowLayout';
import { NexusCard } from '../components/nexus/NexusCard';
import { NexusButton } from '../components/nexus/NexusButton';

export function StateUpdateScreen() {
  const navigate = useNavigate();

  const updates = [
    {
      title: 'מבנה הנתונים הושלם',
      description: 'הסכמה, המיגרציות והדוקומנטציה נוספו לפרויקט',
      icon: <CheckCircle2 className="w-5 h-5 text-success" />,
      impact: 'התשתית המרכזית של המוצר מוכנה'
    },
    {
      title: 'עברנו לשלב הבא',
      description: 'הפרויקט עבר משלב התכנון לשלב הפיתוח',
      icon: <TrendingUp className="w-5 h-5 text-primary" />,
      impact: 'התקדמנו בציר הזמן של הפרויקט'
    },
    {
      title: 'ביצוע מהיר',
      description: 'הסתיים מוקדם מהזמן המתוכנן ב-15 דקות',
      icon: <Zap className="w-5 h-5 text-success" />,
      impact: 'חיסכון בזמן פיתוח'
    },
  ];

  return (
    <FlowLayout projectName="אפליקציית מסחר אלקטרוני">
      <div className="container max-w-4xl mx-auto py-12 px-8 space-y-10">
        {/* Header - Milestone Celebration */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-success/20 to-primary/10 flex items-center justify-center mx-auto mb-4 relative">
            <CheckCircle2 className="w-10 h-10 text-success" />
            <Sparkles className="w-4 h-4 text-primary absolute top-2 right-2 animate-pulse" />
          </div>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-success/10 text-success text-sm font-medium mb-2">
            <Sparkles className="w-4 h-4" />
            <span>אבן דרך הושלמה</span>
          </div>
          <h1 className="text-5xl font-bold leading-tight">עדכנתי את הפרויקט</h1>
          <p className="text-muted-foreground text-xl">
            המשימה שסיימנו שינתה את מצב הפרויקט. הנה מה השתנה.
          </p>
        </div>

        {/* Update Cards - Show Impact */}
        <div className="space-y-4">
          {updates.map((update, index) => (
            <NexusCard key={index} padding="xl" className="relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-success to-primary" />
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-success/20 to-primary/10 flex items-center justify-center flex-shrink-0">
                  {update.icon}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-xl">{update.title}</h3>
                  <p className="text-muted-foreground mt-2">{update.description}</p>
                  <div className="mt-3 flex items-center gap-2 text-sm text-primary">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <span className="font-medium">{update.impact}</span>
                  </div>
                </div>
              </div>
            </NexusCard>
          ))}
        </div>

        {/* Progress Health */}
        <NexusCard>
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">מצב הפרויקט</h3>

            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 rounded-lg bg-success/10">
                <div className="text-2xl font-bold text-success">85%</div>
                <div className="text-xs text-muted-foreground mt-1">התקדמות כללית</div>
              </div>

              <div className="text-center p-4 rounded-lg bg-primary/10">
                <div className="text-2xl font-bold text-primary">12/15</div>
                <div className="text-xs text-muted-foreground mt-1">משימות הושלמו</div>
              </div>

              <div className="text-center p-4 rounded-lg bg-success/10">
                <div className="text-2xl font-bold text-success">מצוין</div>
                <div className="text-xs text-muted-foreground mt-1">בריאות הפרויקט</div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">התקדמות לפרסום</span>
                <span className="font-medium">85%</span>
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-l from-primary to-success rounded-full transition-all"
                  style={{ width: '85%' }}
                />
              </div>
            </div>
          </div>
        </NexusCard>

        {/* Actions */}
        <div className="flex gap-4">
          <NexusButton
            onClick={() => navigate('/next-task')}
            size="lg"
            className="flex-1"
          >
            המשך למשימה הבאה
          </NexusButton>
          <NexusButton
            onClick={() => navigate('/timeline')}
            variant="secondary"
            size="lg"
          >
            הצג ציר זמן
          </NexusButton>
        </div>
      </div>
    </FlowLayout>
  );
}

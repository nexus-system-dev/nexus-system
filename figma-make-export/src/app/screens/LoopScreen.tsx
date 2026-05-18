import { useNavigate } from 'react-router';
import { Play, Eye, Target, Zap } from 'lucide-react';
import { FlowLayout } from '../components/nexus/FlowLayout';
import { NexusCard } from '../components/nexus/NexusCard';
import { NexusButton } from '../components/nexus/NexusButton';
import { NexusTaskCard } from '../components/nexus/NexusTaskCard';

export function LoopScreen() {
  const navigate = useNavigate();

  const currentTask = {
    title: 'תכנן את מבנה הדאטה למוצרים ולקוחות',
    description: 'צור סכמת מסד נתונים שתכלול טבלאות עבור מוצרים, קטגוריות, לקוחות, והזמנות. זה יהווה את הבסיס לכל המערכת.',
    priority: 'high' as const,
    status: 'active' as const,
  };

  const timelineItems = [
    { label: 'הושלם', value: 'הגדרת הפרויקט', status: 'complete' },
    { label: 'הושלם', value: 'הבנת דרישות', status: 'complete' },
    { label: 'פעיל', value: 'תכנון מבנה נתונים', status: 'active' },
    { label: 'הבא', value: 'בניית API', status: 'next' },
    { label: 'הבא', value: 'עיצוב ממשק משתמש', status: 'next' },
  ];

  return (
    <FlowLayout projectName="אפליקציית מסחר אלקטרוני">
      <div className="container max-w-5xl mx-auto p-8 space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold">מה עושים עכשיו</h1>
          <p className="text-muted-foreground text-lg">המשימה הכי חשובה כרגע בפרויקט שלך</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Task */}
          <div className="lg:col-span-2 space-y-6">
            <NexusTaskCard
              title={currentTask.title}
              description={currentTask.description}
              status={currentTask.status}
              priority={currentTask.priority}
              metadata={[
                { label: 'שלב', value: 'תכנון' },
                { label: 'זמן משוער', value: '2-3 שעות' },
              ]}
              icon={<Target className="w-6 h-6 text-primary" />}
            />

            {/* Why This Matters */}
            <NexusCard>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-warning" />
                  <h3 className="font-semibold">למה זה חשוב עכשיו</h3>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  מבנה הנתונים הוא הבסיס של כל המערכת. החלטות שתקבל עכשיו ישפיעו על הביצועים,
                  הגמישות והיכולת להרחיב את המערכת בעתיד. כדאי לעשות את זה נכון מההתחלה.
                </p>
              </div>
            </NexusCard>

            {/* Actions */}
            <div className="flex gap-3">
              <NexusButton
                onClick={() => navigate('/execution')}
                size="lg"
                className="flex-1"
              >
                <Play className="w-5 h-5" />
                התחל ביצוע
              </NexusButton>
              <NexusButton
                onClick={() => navigate('/proof')}
                variant="secondary"
                size="lg"
              >
                <Eye className="w-5 h-5" />
                הצג הוכחה אחרונה
              </NexusButton>
            </div>
          </div>

          {/* Timeline */}
          <div>
            <NexusCard>
              <div className="space-y-4">
                <h3 className="font-semibold">ציר המשימות</h3>
                <div className="space-y-3">
                  {timelineItems.map((item, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div
                        className={`w-3 h-3 rounded-full mt-1 flex-shrink-0 ${
                          item.status === 'complete'
                            ? 'bg-success'
                            : item.status === 'active'
                            ? 'bg-primary animate-pulse'
                            : 'bg-muted'
                        }`}
                      />
                      <div className="flex-1">
                        <p
                          className={`text-sm font-medium ${
                            item.status === 'active' ? 'text-foreground' : 'text-muted-foreground'
                          }`}
                        >
                          {item.value}
                        </p>
                        <p className="text-xs text-muted-foreground">{item.label}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </NexusCard>
          </div>
        </div>
      </div>
    </FlowLayout>
  );
}

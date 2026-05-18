import { useNavigate } from 'react-router';
import { Play, HelpCircle, Code, Brain, Sparkles } from 'lucide-react';
import { FlowLayout } from '../components/nexus/FlowLayout';
import { NexusCard } from '../components/nexus/NexusCard';
import { NexusButton } from '../components/nexus/NexusButton';
import { NexusTaskCard } from '../components/nexus/NexusTaskCard';

export function NextTaskScreen() {
  const navigate = useNavigate();

  const nextTask = {
    title: 'בניית API RESTful למוצרים',
    description: 'צור endpoints עבור CRUD operations על מוצרים, כולל סינון לפי קטגוריה, מיון, ו-pagination. השתמש במבנה הנתונים שיצרנו.',
    priority: 'high' as const,
    status: 'pending' as const,
  };

  return (
    <FlowLayout projectName="אפליקציית מסחר אלקטרוני">
      <div className="container max-w-5xl mx-auto py-12 px-8 space-y-10">
        {/* Header - AI Recommendation */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-2">
            <Brain className="w-4 h-4" />
            <span>המלצה מבוססת AI</span>
          </div>
          <h1 className="text-5xl font-bold leading-tight">הצעד הבא שלך</h1>
          <p className="text-muted-foreground text-xl leading-relaxed">
            ניתחתי את הפרויקט ואת מה שכבר עשינו.
            <br />
            בהתבסס על התלויות וסדר העדיפויות - זאת המשימה הבאה הכי חשובה.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Task */}
          <div className="lg:col-span-2 space-y-6">
            <NexusTaskCard
              title={nextTask.title}
              description={nextTask.description}
              status={nextTask.status}
              priority={nextTask.priority}
              metadata={[
                { label: 'שלב', value: 'פיתוח Backend' },
                { label: 'זמן משוער', value: '3-4 שעות' },
                { label: 'תלויות', value: 'מבנה נתונים (✓)' },
              ]}
              icon={<Code className="w-6 h-6 text-primary" />}
            />

            {/* Why Now */}
            <NexusCard>
              <div className="space-y-3">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-primary" />
                  למה עכשיו?
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  עכשיו שיש לנו מבנה נתונים מוגדר, הגיוני לבנות את ה-API שיאפשר לגשת למידע הזה.
                  זה יאפשר לנו אחר כך לבנות את הממשק הגרפי מעל API יציב ומתועד.
                </p>

                <div className="pt-3 border-t border-border">
                  <h4 className="font-medium text-sm mb-2">מה יהיה אחרי זה:</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• בניית ממשק משתמש לניהול מוצרים</li>
                    <li>• הוספת מערכת אימות והרשאות</li>
                    <li>• אינטגרציה עם מערכת תשלומים</li>
                  </ul>
                </div>
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
                התחל משימה
              </NexusButton>
              <NexusButton variant="secondary" size="lg">
                הצג פירוט
              </NexusButton>
            </div>
          </div>

          {/* Context Cards */}
          <div className="space-y-4">
            <NexusCard padding="md">
              <div className="space-y-3">
                <h4 className="font-semibold text-sm">סטטוס שלב</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">שם השלב</span>
                    <span className="font-medium">Backend Development</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">משימות בשלב</span>
                    <span className="font-medium">0/6</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">התקדמות שלב</span>
                    <span className="font-medium">0%</span>
                  </div>
                </div>
              </div>
            </NexusCard>

            <NexusCard padding="md" className="bg-primary/5 border-primary/20">
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">טיפ</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  כדאי לתכנן את ה-API endpoints לפני שמתחילים לכתוב קוד. זה יעזור לשמור על
                  עקביות ולהימנע משינויים גדולים אחר כך.
                </p>
              </div>
            </NexusCard>

            <NexusCard padding="md">
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">משימות קרובות</h4>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-warning" />
                    <span className="text-muted-foreground">API למוצרים (הבא)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-muted" />
                    <span className="text-muted-foreground">API ללקוחות</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-muted" />
                    <span className="text-muted-foreground">API להזמנות</span>
                  </div>
                </div>
              </div>
            </NexusCard>
          </div>
        </div>
      </div>
    </FlowLayout>
  );
}

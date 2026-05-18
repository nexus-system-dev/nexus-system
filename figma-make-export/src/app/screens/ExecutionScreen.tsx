import { useNavigate } from 'react-router';
import { CheckCircle2, Circle, Loader2, Eye, StopCircle, Zap, Brain, Code } from 'lucide-react';
import { FlowLayout } from '../components/nexus/FlowLayout';
import { NexusCard } from '../components/nexus/NexusCard';
import { NexusButton } from '../components/nexus/NexusButton';

export function ExecutionScreen() {
  const navigate = useNavigate();

  const executionSteps = [
    { label: 'ניתוח דרישות מבנה הנתונים', status: 'complete', time: '13:45', insight: 'זיהיתי 5 ישויות מרכזיות' },
    { label: 'יצירת סכמת PostgreSQL', status: 'complete', time: '13:47', insight: 'עיצוב נורמליזציה מלא' },
    { label: 'הוספת אינדקסים לביצועים', status: 'active', time: '13:49', insight: 'אופטימיזציה לשאילתות נפוצות' },
    { label: 'כתיבת מיגרציות', status: 'pending', time: '', insight: 'גירסה ראשונית + rollback' },
    { label: 'יצירת דוקומנטציה', status: 'pending', time: '', insight: 'תיעוד מפורט לצוות' },
  ];

  const logs = [
    { time: '13:49:23', message: 'Creating index on products.category_id...', type: 'info' },
    { time: '13:49:15', message: 'Adding foreign key constraints...', type: 'info' },
    { time: '13:48:42', message: 'Table "orders" created successfully ✓', type: 'success' },
    { time: '13:48:31', message: 'Table "customers" created successfully ✓', type: 'success' },
  ];

  return (
    <FlowLayout projectName="אפליקציית מסחר אלקטרוני">
      <div className="container max-w-5xl mx-auto py-12 px-8 space-y-10">
        {/* Header - AI at Work */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-2 animate-pulse">
            <Brain className="w-4 h-4" />
            <span>Nexus עובד...</span>
          </div>
          <h1 className="text-5xl font-bold leading-tight">מבצעים את המשימה</h1>
          <p className="text-muted-foreground text-xl">
            אני מתכנן ובונה את מבנה הנתונים למערכת המסחר שלך
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Execution Progress */}
          <div className="lg:col-span-2 space-y-6">
            {/* Current Task Card - More Narrative */}
            <NexusCard className="border-2 border-primary/20">
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Zap className="w-6 h-6 text-primary" />
                    <h3 className="text-xl font-semibold">מה קורה עכשיו</h3>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10">
                    <Loader2 className="w-4 h-4 text-primary animate-spin" />
                    <span className="text-sm font-medium text-primary">בתהליך</span>
                  </div>
                </div>

                <div className="space-y-3">
                  {executionSteps.map((step, index) => (
                    <div
                      key={index}
                      className={`flex items-start gap-4 p-4 rounded-xl transition-all ${
                        step.status === 'active'
                          ? 'bg-gradient-to-l from-primary/10 to-transparent border-2 border-primary/30 shadow-md'
                          : step.status === 'complete'
                          ? 'bg-success/5'
                          : 'bg-muted/30'
                      }`}
                    >
                      {step.status === 'complete' ? (
                        <CheckCircle2 className="w-6 h-6 text-success flex-shrink-0 mt-0.5" />
                      ) : step.status === 'active' ? (
                        <Loader2 className="w-6 h-6 text-primary flex-shrink-0 mt-0.5 animate-spin" />
                      ) : (
                        <Circle className="w-6 h-6 text-muted-foreground flex-shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <p className={`font-semibold ${
                            step.status === 'active' ? 'text-foreground text-base' : 'text-muted-foreground'
                          }`}
                        >
                          {step.label}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">{step.insight}</p>
                        {step.time && (
                          <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1">
                            <span className="w-1 h-1 rounded-full bg-muted-foreground" />
                            {step.time}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Progress Bar */}
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">התקדמות</span>
                    <span className="font-medium">60%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-l from-primary to-[#3b82f6] transition-all duration-500 rounded-full"
                      style={{ width: '60%' }}
                    />
                  </div>
                </div>
              </div>
            </NexusCard>

            {/* Recent Logs - Real AI Activity */}
            <NexusCard className="bg-gradient-to-br from-muted/30 to-transparent">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Code className="w-5 h-5 text-muted-foreground" />
                  <h3 className="text-lg font-semibold">לוג פעילות אחרונה</h3>
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {logs.map((log, index) => (
                    <div
                      key={index}
                      className="flex gap-3 text-xs font-mono p-3 rounded-lg bg-card border border-border hover:border-primary/30 transition-colors"
                    >
                      <span className="text-muted-foreground shrink-0">{log.time}</span>
                      <span className={`${
                        log.type === 'success' ? 'text-success' : 'text-foreground'
                      }`}>{log.message}</span>
                    </div>
                  ))}
                </div>
              </div>
            </NexusCard>

            {/* Actions */}
            <div className="flex gap-3">
              <NexusButton
                onClick={() => navigate('/proof')}
                size="lg"
                className="flex-1"
              >
                <Eye className="w-5 h-5" />
                הצג הוכחה כשמוכן
              </NexusButton>
              <NexusButton variant="secondary" size="lg">
                <StopCircle className="w-5 h-5" />
                עצור ביצוע
              </NexusButton>
            </div>
          </div>

          {/* Stats */}
          <div className="space-y-4">
            <NexusCard padding="md">
              <div className="space-y-3">
                <h4 className="font-semibold text-sm">סטטיסטיקות</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">זמן ריצה</span>
                    <span className="font-medium">4:23</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">שלבים הושלמו</span>
                    <span className="font-medium">3/5</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">קבצים נוצרו</span>
                    <span className="font-medium">4</span>
                  </div>
                </div>
              </div>
            </NexusCard>

            <NexusCard padding="md" className="bg-primary/5 border-primary/20">
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">מה קורה עכשיו</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Nexus מוסיף אינדקסים למסד הנתונים כדי לשפר ביצועי חיפוש ושאילתות על טבלאות גדולות.
                </p>
              </div>
            </NexusCard>
          </div>
        </div>
      </div>
    </FlowLayout>
  );
}

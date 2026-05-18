import { useNavigate } from 'react-router';
import { Users, Target, Lightbulb, TrendingUp, Edit, Sparkles, CheckCircle2 } from 'lucide-react';
import { FlowLayout } from '../components/nexus/FlowLayout';
import { NexusCard } from '../components/nexus/NexusCard';
import { NexusButton } from '../components/nexus/NexusButton';
import { NexusStepper } from '../components/nexus/NexusStepper';

export function UnderstandingScreen() {
  const navigate = useNavigate();

  const steps = [
    { label: 'יצירה', status: 'complete' as const },
    { label: 'הבנת הפרויקט', status: 'complete' as const },
    { label: 'סיכום הבנה', status: 'active' as const },
    { label: 'פעולה הבאה', status: 'inactive' as const },
  ];

  const summaryCards = [
    {
      icon: <Users className="w-6 h-6 text-primary" />,
      title: 'קהל יעד',
      content: 'בעלי עסקים קטנים ובינוניים שרוצים למכור מוצרים אונליין אבל אין להם ידע טכני לבנות חנות מקוונת.',
      insight: 'שוק בוגר עם צורך ברור ובעיית גישה'
    },
    {
      icon: <Target className="w-6 h-6 text-primary" />,
      title: 'הבעיה',
      content: 'פלטפורמות מסחר קיימות מסובכות מדי או יקרות מדי עבור עסקים קטנים. הם צריכים פתרון פשוט ונגיש.',
      insight: 'פער בין המוצרים הקיימים לצורכי הקהל'
    },
    {
      icon: <Lightbulb className="w-6 h-6 text-primary" />,
      title: 'הפתרון',
      content: 'פלטפורמת מסחר פשוטה עם ממשק אינטואיטיבי, תשלומים מובנים, וכלים לניהול מלאי ולקוחות.',
      insight: 'גישה ממוקדת פשטות על פני תכונות'
    },
    {
      icon: <TrendingUp className="w-6 h-6 text-primary" />,
      title: 'מטרת ההצלחה',
      content: '100 עסקים פעילים בשלושת החודשים הראשונים, עם ממוצע של 50 עסקאות לעסק בחודש.',
      insight: 'יעד ריאלי ומדיד למוכיחות קונספט'
    },
  ];

  return (
    <FlowLayout projectName="אפליקציית מסחר אלקטרוני">
      <div className="container max-w-5xl mx-auto py-12 px-8 space-y-12">
        <NexusStepper steps={steps} />

        {/* Header - Critical Validation Moment */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-2">
            <Sparkles className="w-4 h-4" />
            <span>רגע קריטי בתהליך</span>
          </div>
          <h1 className="text-5xl font-bold leading-tight">זה מה שהבנתי</h1>
          <p className="text-muted-foreground text-xl leading-relaxed">
            ניתחתי את השיחה שלנו והפקתי את ארבעת המרכיבים המרכזיים של הפרויקט.
            <br />
            אם זה נכון - נתקדם. אם לא - נתקן.
          </p>
        </div>

        {/* Summary Cards - More Narrative */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto">
          {summaryCards.map((card, index) => (
            <NexusCard key={index} padding="xl" className="relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary to-transparent opacity-50" />

              <div className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center flex-shrink-0">
                      {card.icon}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold">{card.title}</h3>
                      <p className="text-xs text-muted-foreground mt-1">{card.insight}</p>
                    </div>
                  </div>
                  <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" />
                </div>
                <p className="text-muted-foreground leading-relaxed text-base">
                  {card.content}
                </p>
              </div>
            </NexusCard>
          ))}
        </div>

        {/* Why This Matters */}
        <NexusCard className="max-w-3xl mx-auto bg-gradient-to-br from-primary/5 to-transparent border-primary/20">
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">למה זה חשוב</h3>
            <p className="text-muted-foreground leading-relaxed">
              ההבנה הזאת היא הבסיס לכל החלטה שנקבל בהמשך. אם נבין נכון את הקהל והבעיה,
              נבנה את המוצר הנכון. אם לא - נבזבז זמן ומשאבים.
            </p>
            <div className="flex items-center gap-2 text-sm text-success pt-2">
              <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
              <span className="font-medium">רמת ביטחון בהבנה: 94% (8 שאלות מפורטות)</span>
            </div>
          </div>
        </NexusCard>

        {/* Actions - Clear Next Steps */}
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="flex gap-4">
            <NexusButton
              onClick={() => navigate('/loop')}
              size="lg"
              className="flex-1 h-14 text-lg"
            >
              <CheckCircle2 className="w-5 h-5" />
              נכון, בוא נתחיל לבנות
            </NexusButton>
            <NexusButton
              onClick={() => navigate('/onboarding')}
              variant="secondary"
              size="lg"
              className="h-14"
            >
              <Edit className="w-5 h-5" />
              צריך תיקון
            </NexusButton>
          </div>
          <p className="text-center text-sm text-muted-foreground">
            אם תאשר, Nexus יתחיל לעבוד על המשימה הראשונה
          </p>
        </div>
      </div>
    </FlowLayout>
  );
}

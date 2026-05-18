import { useNavigate } from 'react-router';
import { CheckCircle2, FileText, Code, Database, ArrowRight } from 'lucide-react';
import { FlowLayout } from '../components/nexus/FlowLayout';
import { NexusCard } from '../components/nexus/NexusCard';
import { NexusButton } from '../components/nexus/NexusButton';

interface TimelineItem {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  type: 'milestone' | 'task' | 'output';
  icon: React.ReactNode;
  status: 'complete';
}

export function TimelineScreen() {
  const navigate = useNavigate();

  const timelineItems: TimelineItem[] = [
    {
      id: '1',
      title: 'מבנה נתונים הושלם',
      description: 'סכמת PostgreSQL עם 5 טבלאות, אינדקסים ומיגרציות',
      timestamp: 'לפני שעתיים',
      type: 'milestone',
      icon: <Database className="w-5 h-5 text-success" />,
      status: 'complete',
    },
    {
      id: '2',
      title: 'תכנון ארכיטקטורה',
      description: 'הוגדרה ארכיטקטורת המערכת והחלוקה למודולים',
      timestamp: 'אתמול',
      type: 'task',
      icon: <Code className="w-5 h-5 text-success" />,
      status: 'complete',
    },
    {
      id: '3',
      title: 'הבנת הפרויקט הושלמה',
      description: 'אושרו קהל היעד, הבעיה, והפתרון',
      timestamp: 'לפני יומיים',
      type: 'milestone',
      icon: <CheckCircle2 className="w-5 h-5 text-success" />,
      status: 'complete',
    },
    {
      id: '4',
      title: 'דוקומנטציה ראשונית',
      description: 'נכתב README ותיעוד התחלתי לפרויקט',
      timestamp: 'לפני יומיים',
      type: 'output',
      icon: <FileText className="w-5 h-5 text-success" />,
      status: 'complete',
    },
  ];

  return (
    <FlowLayout projectName="אפליקציית מסחר אלקטרוני">
      <div className="container max-w-4xl mx-auto p-8 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold">היסטוריית הפרויקט</h1>
            <p className="text-muted-foreground text-lg mt-2">
              כל מה שקרה בפרויקט עד עכשיו
            </p>
          </div>

          <NexusButton onClick={() => navigate('/loop')} size="lg">
            חזור לצעד הנוכחי
          </NexusButton>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical Line */}
          <div className="absolute right-6 top-0 bottom-0 w-0.5 bg-border" />

          {/* Timeline Items */}
          <div className="space-y-8">
            {timelineItems.map((item, index) => (
              <div key={item.id} className="relative flex gap-6">
                {/* Icon */}
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-full bg-success/10 border-4 border-canvas flex items-center justify-center">
                    {item.icon}
                  </div>
                </div>

                {/* Content */}
                <NexusCard className="flex-1" hover>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold">{item.title}</h3>
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-success/10 text-success">
                          {item.type === 'milestone' ? 'אבן דרך' : item.type === 'task' ? 'משימה' : 'פלט'}
                        </span>
                      </div>
                      <p className="text-muted-foreground">{item.description}</p>
                      <p className="text-sm text-muted-foreground">{item.timestamp}</p>
                    </div>

                    <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                      <ArrowRight className="w-5 h-5 text-muted-foreground" />
                    </button>
                  </div>
                </NexusCard>
              </div>
            ))}
          </div>
        </div>

        {/* Summary Stats */}
        <NexusCard>
          <div className="grid grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-primary">12</div>
              <div className="text-sm text-muted-foreground mt-1">משימות הושלמו</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-success">3</div>
              <div className="text-sm text-muted-foreground mt-1">אבני דרך</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary">18</div>
              <div className="text-sm text-muted-foreground mt-1">קבצים נוצרו</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-success">15h</div>
              <div className="text-sm text-muted-foreground mt-1">זמן עבודה</div>
            </div>
          </div>
        </NexusCard>
      </div>
    </FlowLayout>
  );
}

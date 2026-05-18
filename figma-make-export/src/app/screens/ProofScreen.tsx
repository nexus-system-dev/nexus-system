import { useNavigate } from 'react-router';
import { Download, ExternalLink, FileText, CheckCircle2, Database, Sparkles, Award } from 'lucide-react';
import { FlowLayout } from '../components/nexus/FlowLayout';
import { NexusCard } from '../components/nexus/NexusCard';
import { NexusButton } from '../components/nexus/NexusButton';

export function ProofScreen() {
  const navigate = useNavigate();

  const successCriteria = [
    { criterion: 'עמידה בדרישות המקוריות', status: 'passed', detail: 'כל הדרישות שהוגדרו מכוסות' },
    { criterion: 'איכות ביצוע', status: 'passed', detail: 'עומד בסטנדרטים של Nexus' },
    { criterion: 'שלמות ותיעוד', status: 'passed', detail: 'כולל כל הרכיבים הנדרשים' },
    { criterion: 'מוכן לשימוש', status: 'passed', detail: 'יכול לעבור למשימה הבאה' },
  ];

  const deliverables = [
    { name: 'schema.sql', size: '4.2 KB', type: 'SQL Schema', description: 'מבנה נתונים מלא' },
    { name: 'migrations/', size: '3 files', type: 'Migration Files', description: 'סקריפטים לגרסה ראשונית' },
    { name: 'DATABASE.md', size: '2.1 KB', type: 'Documentation', description: 'תיעוד טכני מפורט' },
  ];

  return (
    <FlowLayout projectName="אפליקציית מסחר אלקטרוני">
      <div className="container max-w-5xl mx-auto py-12 px-8 space-y-10">
        {/* Header - Celebration */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-success/20 to-success/5 flex items-center justify-center mx-auto mb-4 relative">
            <CheckCircle2 className="w-10 h-10 text-success" />
            <Sparkles className="w-4 h-4 text-success absolute top-2 right-2 animate-pulse" />
          </div>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-success/10 text-success text-sm font-medium mb-2">
            <Award className="w-4 h-4" />
            <span>המשימה הושלמה בהצלחה</span>
          </div>
          <h1 className="text-5xl font-bold leading-tight">הנה מה שבניתי</h1>
          <p className="text-muted-foreground text-xl">
            יצרתי מבנה נתונים מלא, מותאם לדרישות שלך ומוכן לשימוש
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Proof Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Preview Card */}
            <NexusCard>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Database className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">סכמת מסד נתונים</h3>
                    <p className="text-sm text-muted-foreground">PostgreSQL Schema</p>
                  </div>
                </div>

                {/* Schema Preview */}
                <div className="bg-muted/50 rounded-lg p-4 font-mono text-sm overflow-x-auto">
                  <pre className="text-foreground">
{`CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  category_id INTEGER REFERENCES categories(id),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_price ON products(price);`}
                  </pre>
                </div>
              </div>
            </NexusCard>

            {/* Success Criteria - Universal Validation */}
            <NexusCard>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-6 h-6 text-success" />
                  <h3 className="text-xl font-semibold">קריטריוני הצלחה</h3>
                </div>
                <div className="space-y-3">
                  {successCriteria.map((item, index) => (
                    <div key={index} className="flex items-start gap-4 p-3 rounded-lg bg-success/5 border border-success/20">
                      <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-semibold text-foreground">{item.criterion}</p>
                        <p className="text-sm text-muted-foreground mt-1">{item.detail}</p>
                      </div>
                      <span className="text-xs font-medium text-success px-2 py-1 rounded-full bg-success/10">
                        {item.status === 'passed' ? '✓ עבר' : 'נכשל'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </NexusCard>

            {/* Deliverables - What Was Produced */}
            <NexusCard>
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">מה הופק</h3>
                <div className="space-y-3">
                  {deliverables.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-4 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <FileText className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-4">
                          <p className="font-semibold">{item.name}</p>
                          <span className="text-xs font-medium text-primary px-2 py-1 rounded-full bg-primary/10">
                            {item.type}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">{item.size}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </NexusCard>

            {/* Actions */}
            <div className="flex gap-3">
              <NexusButton
                onClick={() => navigate('/confirmation')}
                size="lg"
                className="flex-1"
              >
                המשך לאישור
              </NexusButton>
              <NexusButton variant="secondary" size="lg">
                <ExternalLink className="w-5 h-5" />
                פתח בטאב חדש
              </NexusButton>
              <NexusButton variant="secondary" size="lg">
                <Download className="w-5 h-5" />
                הורד קבצים
              </NexusButton>
            </div>
          </div>

          {/* Metrics */}
          <div className="space-y-4">
            <NexusCard padding="md">
              <div className="space-y-3">
                <h4 className="font-semibold text-sm">מדדים</h4>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">איכות קוד</span>
                      <span className="font-medium text-success">98%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-success" style={{ width: '98%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">כיסוי דוקומנטציה</span>
                      <span className="font-medium text-success">100%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-success" style={{ width: '100%' }} />
                    </div>
                  </div>

                  <div className="pt-3 border-t border-border space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">זמן ביצוע</span>
                      <span className="font-medium">4:47</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">קווי קוד</span>
                      <span className="font-medium">342</span>
                    </div>
                  </div>
                </div>
              </div>
            </NexusCard>

            <NexusCard padding="md" className="bg-success/10 border-success/20">
              <div className="space-y-2">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-success" />
                  הוכחת הצלחה
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  הסכמה נבדקה והתקבלה בהצלחה. כל הטבלאות, האינדקסים והקשרים פועלים כמצופה.
                </p>
              </div>
            </NexusCard>
          </div>
        </div>
      </div>
    </FlowLayout>
  );
}

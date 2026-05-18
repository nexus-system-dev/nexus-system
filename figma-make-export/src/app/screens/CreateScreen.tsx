import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Upload, Link as LinkIcon, Lightbulb, FileText } from 'lucide-react';
import { FlowLayout } from '../components/nexus/FlowLayout';
import { NexusCard } from '../components/nexus/NexusCard';
import { NexusButton } from '../components/nexus/NexusButton';
import { NexusInput } from '../components/nexus/NexusInput';
import { NexusStepper } from '../components/nexus/NexusStepper';

export function CreateScreen() {
  const navigate = useNavigate();
  const [projectName, setProjectName] = useState('');
  const [projectIdea, setProjectIdea] = useState('');
  const [projectUrl, setProjectUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate('/onboarding');
    }, 1500);
  };

  const steps = [
    { label: 'יצירה', status: 'active' as const },
    { label: 'הבנת הפרויקט', status: 'inactive' as const },
    { label: 'סיכום הבנה', status: 'inactive' as const },
    { label: 'פעולה הבאה', status: 'inactive' as const },
  ];

  return (
    <FlowLayout>
      <div className="container max-w-5xl mx-auto p-8 space-y-8">
        {/* Stepper */}
        <NexusStepper steps={steps} />

        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold">מה אתה רוצה לבנות?</h1>
          <p className="text-muted-foreground text-lg">שתף את הרעיון שלך ו-Nexus יעזור לך להפוך אותו למציאות</p>
        </div>

        {/* Main Form */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <NexusCard>
              <div className="space-y-6">
                <NexusInput
                  label="שם הפרויקט"
                  placeholder="לדוגמה: אפליקציית מסחר אלקטרוני"
                  value={projectName}
                  onChange={setProjectName}
                  required
                />

                <NexusInput
                  label="תאר את הרעיון שלך"
                  placeholder="ספר לנו על הפרויקט שלך - מה הוא אמור לעשות, למי הוא מיועד, ואיזו בעיה הוא פותר..."
                  value={projectIdea}
                  onChange={setProjectIdea}
                  multiline
                  rows={8}
                  required
                />

                <NexusInput
                  label="קישור רלוונטי (אופציונלי)"
                  placeholder="https://example.com"
                  value={projectUrl}
                  onChange={setProjectUrl}
                  type="url"
                  icon={<LinkIcon className="w-4 h-4" />}
                />

                {/* File Upload */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-foreground">
                    קבצים או מסמכים (אופציונלי)
                  </label>
                  <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 hover:bg-accent/30 transition-all cursor-pointer">
                    <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                    <p className="text-sm font-medium text-foreground">גרור קבצים לכאן או לחץ לבחירה</p>
                    <p className="text-xs text-muted-foreground mt-1">PDF, DOC, TXT, תמונות - עד 10MB</p>
                  </div>
                </div>
              </div>
            </NexusCard>

            <div className="flex gap-4">
              <NexusButton
                onClick={handleCreate}
                loading={loading}
                disabled={!projectName || !projectIdea}
                size="lg"
                className="flex-1"
              >
                צור פרויקט והתחל
              </NexusButton>
              <NexusButton
                onClick={() => navigate('/')}
                variant="secondary"
                size="lg"
              >
                ביטול
              </NexusButton>
            </div>
          </div>

          {/* Helper Cards */}
          <div className="space-y-4">
            <NexusCard padding="md" className="bg-accent/30 border-accent">
              <div className="flex gap-3">
                <Lightbulb className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-semibold text-sm">טיפ מהיר</h4>
                  <p className="text-xs text-muted-foreground">
                    ככל שתספק יותר פרטים על הרעיון, Nexus יוכל לעזור לך טוב יותר לבנות אותו.
                  </p>
                </div>
              </div>
            </NexusCard>

            <NexusCard padding="md">
              <div className="flex gap-3">
                <FileText className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-semibold text-sm">מה קורה אחר כך?</h4>
                  <p className="text-xs text-muted-foreground">
                    Nexus ישאל מספר שאלות כדי להבין טוב יותר את הפרויקט, הקהל יעד, והבעיה שאתה פותר.
                  </p>
                </div>
              </div>
            </NexusCard>
          </div>
        </div>
      </div>
    </FlowLayout>
  );
}

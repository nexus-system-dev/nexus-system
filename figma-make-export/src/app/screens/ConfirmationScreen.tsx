import { useNavigate } from 'react-router';
import { ThumbsUp, Edit3, AlertTriangle } from 'lucide-react';
import { FlowLayout } from '../components/nexus/FlowLayout';
import { NexusCard } from '../components/nexus/NexusCard';
import { NexusButton } from '../components/nexus/NexusButton';

export function ConfirmationScreen() {
  const navigate = useNavigate();

  return (
    <FlowLayout projectName="אפליקציית מסחר אלקטרוני">
      <div className="container max-w-5xl mx-auto py-12 px-8 space-y-10">
        {/* Header - Critical Decision */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-warning/10 text-warning text-sm font-medium mb-2">
            <AlertTriangle className="w-4 h-4" />
            <span>נקודת החלטה קריטית</span>
          </div>
          <h1 className="text-5xl font-bold leading-tight">מה דעתך על התוצאה?</h1>
          <p className="text-muted-foreground text-xl leading-relaxed">
            לפני שנמשיך הלאה, אני צריך לדעת: התוצאה הזאת עונה על הציפיות שלך?
            <br />
            הבחירה שלך תקבע את הצעד הבא.
          </p>
        </div>

        {/* Decision Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {/* Approve Card */}
          <NexusCard
            hover
            className="cursor-pointer group transition-all hover:border-success/50 hover:shadow-lg"
            padding="xl"
          >
            <div className="text-center space-y-4">
              <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto group-hover:bg-success/20 transition-colors">
                <ThumbsUp className="w-10 h-10 text-success" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-semibold">זה טוב, המשך</h3>
                <p className="text-muted-foreground">
                  התוצאה עונה על הציפיות ואפשר להמשיך למשימה הבאה
                </p>
              </div>
              <NexusButton
                onClick={() => navigate('/state-update')}
                variant="secondary"
                className="w-full border-2 border-success/20 hover:bg-success/10"
              >
                אשר ומשך
              </NexusButton>
            </div>
          </NexusCard>

          {/* Needs Changes Card */}
          <NexusCard
            hover
            className="cursor-pointer group transition-all hover:border-warning/50 hover:shadow-lg"
            padding="xl"
          >
            <div className="text-center space-y-4">
              <div className="w-20 h-20 rounded-full bg-warning/10 flex items-center justify-center mx-auto group-hover:bg-warning/20 transition-colors">
                <Edit3 className="w-10 h-10 text-warning" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-semibold">צריך שינויים</h3>
                <p className="text-muted-foreground">
                  יש משהו שצריך לתקן או לשנות בתוצאה
                </p>
              </div>
              <NexusButton
                onClick={() => navigate('/loop')}
                variant="secondary"
                className="w-full border-2 border-warning/20 hover:bg-warning/10"
              >
                בקש שינויים
              </NexusButton>
            </div>
          </NexusCard>
        </div>

        {/* Summary */}
        <NexusCard className="max-w-2xl mx-auto bg-muted/30">
          <div className="space-y-3">
            <h3 className="font-semibold">סיכום המשימה</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>• נוצרה סכמת מסד נתונים מלאה</p>
              <p>• הוספו אינדקסים ואילוצים</p>
              <p>• נכתבה דוקומנטציה מפורטת</p>
              <p>• הכל נבדק ועובד</p>
            </div>
          </div>
        </NexusCard>

        {/* Note */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            ההחלטה שלך תשפיע על המשך התהליך. אם תאשר, Nexus יעבור למשימה הבאה.
          </p>
        </div>
      </div>
    </FlowLayout>
  );
}

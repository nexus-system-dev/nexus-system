import { BookOpen, MessageCircle, Video, FileText, ExternalLink, Search } from 'lucide-react';
import { NexusLayout } from '../components/nexus/NexusLayout';
import { NexusCard } from '../components/nexus/NexusCard';
import { NexusButton } from '../components/nexus/NexusButton';
import { NexusInput } from '../components/nexus/NexusInput';

export function HelpScreen() {
  const helpCategories = [
    {
      icon: <BookOpen className="w-6 h-6 text-primary" />,
      title: 'תיעוד Nexus',
      description: 'מדריכים מפורטים לכל תכונה ויכולת במערכת',
      link: 'פתח תיעוד',
    },
    {
      icon: <Video className="w-6 h-6 text-primary" />,
      title: 'וידאו הדרכה',
      description: 'סרטונים קצרים שמסבירים איך להשתמש ב-Nexus',
      link: 'צפה בוידאו',
    },
    {
      icon: <MessageCircle className="w-6 h-6 text-primary" />,
      title: 'קהילה ופורומים',
      description: 'שאל שאלות וקבל עזרה ממשתמשי Nexus אחרים',
      link: 'הצטרף לקהילה',
    },
    {
      icon: <FileText className="w-6 h-6 text-primary" />,
      title: 'דוגמאות ותבניות',
      description: 'פרויקטים לדוגמה ותבניות מוכנות לשימוש',
      link: 'גלה דוגמאות',
    },
  ];

  const quickLinks = [
    { title: 'איך מתחילים עם Nexus?', category: 'התחלה' },
    { title: 'הבנת תהליך ה-AI Loop', category: 'מושגי יסוד' },
    { title: 'ניהול פרויקטים מרובים', category: 'תכונות מתקדמות' },
    { title: 'אינטגרציות עם כלים חיצוניים', category: 'אינטגרציות' },
    { title: 'פתרון בעיות נפוצות', category: 'תמיכה טכנית' },
  ];

  return (
    <NexusLayout>
      <div className="container max-w-6xl mx-auto p-8 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold">מרכז העזרה</h1>
          <p className="text-muted-foreground text-lg mt-2">
            כל מה שאתה צריך כדי להצליח עם Nexus
          </p>
        </div>

        {/* Search */}
        <NexusCard>
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">חפש בתיעוד</h3>
            <NexusInput
              placeholder="לדוגמה: איך ליצור פרויקט חדש..."
              icon={<Search className="w-4 h-4" />}
            />
          </div>
        </NexusCard>

        {/* Help Categories */}
        <div>
          <h2 className="text-2xl font-semibold mb-6">איך נוכל לעזור?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {helpCategories.map((category, index) => (
              <NexusCard key={index} hover padding="lg">
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center flex-shrink-0">
                      {category.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold">{category.title}</h3>
                      <p className="text-muted-foreground mt-2">{category.description}</p>
                    </div>
                  </div>
                  <button className="flex items-center gap-2 text-sm font-medium text-primary hover:gap-3 transition-all">
                    <span>{category.link}</span>
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              </NexusCard>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h2 className="text-2xl font-semibold mb-6">שאלות נפוצות</h2>
          <NexusCard>
            <div className="space-y-3">
              {quickLinks.map((link, index) => (
                <button
                  key={index}
                  className="w-full flex items-center justify-between p-4 rounded-lg hover:bg-muted transition-colors text-right"
                >
                  <div>
                    <p className="font-medium">{link.title}</p>
                    <p className="text-sm text-muted-foreground mt-1">{link.category}</p>
                  </div>
                  <ExternalLink className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                </button>
              ))}
            </div>
          </NexusCard>
        </div>

        {/* Contact Support */}
        <NexusCard className="bg-gradient-to-br from-primary/5 to-transparent border-primary/20">
          <div className="flex items-center justify-between gap-6">
            <div className="flex-1">
              <h3 className="text-xl font-semibold mb-2">לא מצאת מה שחיפשת?</h3>
              <p className="text-muted-foreground">
                צוות התמיכה שלנו זמין לעזור לך עם כל שאלה או בעיה
              </p>
            </div>
            <div className="flex gap-3">
              <NexusButton size="lg">
                <MessageCircle className="w-5 h-5" />
                פתח פנייה
              </NexusButton>
              <NexusButton variant="secondary" size="lg">
                צ'אט חי
              </NexusButton>
            </div>
          </div>
        </NexusCard>
      </div>
    </NexusLayout>
  );
}

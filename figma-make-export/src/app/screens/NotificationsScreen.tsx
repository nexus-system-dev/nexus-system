import { CheckCircle2, Clock, AlertCircle, Bell } from 'lucide-react';
import { NexusLayout } from '../components/nexus/NexusLayout';
import { NexusCard } from '../components/nexus/NexusCard';
import { NexusButton } from '../components/nexus/NexusButton';

interface Notification {
  id: string;
  type: 'success' | 'info' | 'warning';
  title: string;
  message: string;
  time: string;
  read: boolean;
}

export function NotificationsScreen() {
  const notifications: Notification[] = [
    {
      id: '1',
      type: 'success',
      title: 'משימה הושלמה',
      message: 'מבנה הנתונים נוצר בהצלחה ומוכן לשימוש',
      time: 'לפני 10 דקות',
      read: false,
    },
    {
      id: '2',
      type: 'info',
      title: 'משימה חדשה זמינה',
      message: 'בניית API למוצרים מוכנה להתחלה',
      time: 'לפני 15 דקות',
      read: false,
    },
    {
      id: '3',
      type: 'success',
      title: 'ביקורת הושלמה',
      message: 'הקוד עבר ביקורת אבטחה בהצלחה',
      time: 'לפני שעה',
      read: true,
    },
  ];

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-success" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-warning" />;
      default:
        return <Bell className="w-5 h-5 text-primary" />;
    }
  };

  return (
    <NexusLayout>
      <div className="container max-w-4xl mx-auto p-8 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold">התראות</h1>
            <p className="text-muted-foreground text-lg mt-2">
              עדכונים ופעולות חשובות בפרויקט
            </p>
          </div>

          <NexusButton variant="secondary">
            סמן הכל כנקרא
          </NexusButton>
        </div>

        <div className="space-y-3">
          {notifications.map((notification) => (
            <NexusCard
              key={notification.id}
              padding="lg"
              className={notification.read ? 'opacity-60' : ''}
            >
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-lg ${
                  notification.type === 'success' ? 'bg-success/10' :
                  notification.type === 'warning' ? 'bg-warning/10' : 'bg-primary/10'
                } flex items-center justify-center flex-shrink-0`}>
                  {getIcon(notification.type)}
                </div>

                <div className="flex-1">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-semibold">{notification.title}</h3>
                      <p className="text-muted-foreground mt-1">{notification.message}</p>
                      <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>{notification.time}</span>
                      </div>
                    </div>
                    {!notification.read && (
                      <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-2" />
                    )}
                  </div>
                </div>
              </div>
            </NexusCard>
          ))}
        </div>
      </div>
    </NexusLayout>
  );
}

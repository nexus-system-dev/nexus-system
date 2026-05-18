import { User, Bell, Shield, Palette } from 'lucide-react';
import { NexusLayout } from '../components/nexus/NexusLayout';
import { NexusCard } from '../components/nexus/NexusCard';
import { NexusButton } from '../components/nexus/NexusButton';
import { NexusInput } from '../components/nexus/NexusInput';

export function SettingsScreen() {
  return (
    <NexusLayout>
      <div className="container max-w-5xl mx-auto p-8 space-y-8">
        <div>
          <h1 className="text-4xl font-bold">הגדרות</h1>
          <p className="text-muted-foreground text-lg mt-2">
            נהל את הפרופיל והעדפות המערכת שלך
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Settings Menu */}
          <div className="space-y-2">
            {[
              { icon: <User className="w-5 h-5" />, label: 'פרופיל', active: true },
              { icon: <Bell className="w-5 h-5" />, label: 'התראות', active: false },
              { icon: <Shield className="w-5 h-5" />, label: 'אבטחה', active: false },
              { icon: <Palette className="w-5 h-5" />, label: 'מראה', active: false },
            ].map((item, index) => (
              <button
                key={index}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  item.active
                    ? 'bg-primary/10 text-primary'
                    : 'hover:bg-muted text-foreground'
                }`}
              >
                {item.icon}
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </div>

          {/* Settings Content */}
          <div className="lg:col-span-3 space-y-6">
            <NexusCard>
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold mb-4">פרטים אישיים</h3>

                  <div className="space-y-4">
                    <NexusInput
                      label="שם מלא"
                      value="אלכס ברנד"
                      placeholder="הכנס שם מלא"
                    />

                    <NexusInput
                      label="אימייל"
                      type="email"
                      value="alex@example.com"
                      placeholder="your@email.com"
                    />

                    <NexusInput
                      label="תפקיד"
                      value="Product Manager"
                      placeholder="התפקיד שלך"
                    />
                  </div>
                </div>
              </div>
            </NexusCard>

            <NexusCard>
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">העדפות</h3>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">שפת ממשק</p>
                      <p className="text-sm text-muted-foreground">בחר את שפת הממשק</p>
                    </div>
                    <select className="px-4 py-2 bg-input-background border border-input-border rounded-lg">
                      <option>עברית</option>
                      <option>English</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <div>
                      <p className="font-medium">התראות אימייל</p>
                      <p className="text-sm text-muted-foreground">קבל עדכונים באימייל</p>
                    </div>
                    <button className="w-12 h-6 bg-primary rounded-full relative">
                      <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            </NexusCard>

            <div className="flex gap-3">
              <NexusButton size="lg">שמור שינויים</NexusButton>
              <NexusButton variant="secondary" size="lg">ביטול</NexusButton>
            </div>
          </div>
        </div>
      </div>
    </NexusLayout>
  );
}

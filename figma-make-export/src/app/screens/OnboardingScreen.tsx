import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Send, RotateCcw, CheckCircle, AlertCircle } from 'lucide-react';
import { FlowLayout } from '../components/nexus/FlowLayout';
import { NexusCard } from '../components/nexus/NexusCard';
import { NexusButton } from '../components/nexus/NexusButton';
import { NexusStepper } from '../components/nexus/NexusStepper';

interface Message {
  role: 'ai' | 'user';
  content: string;
}

export function OnboardingScreen() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'ai',
      content: 'שלום! בוא נתחיל להבין את הפרויקט שלך. מי הקהל יעד של המוצר שלך?',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = () => {
    if (!input.trim()) return;

    const newMessages = [
      ...messages,
      { role: 'user' as const, content: input },
    ];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    setTimeout(() => {
      setMessages([
        ...newMessages,
        {
          role: 'ai',
          content: 'מעולה! עכשיו ספר לי - איזו בעיה אתה פותר עבור הקהל הזה?',
        },
      ]);
      setLoading(false);
    }, 1000);
  };

  const steps = [
    { label: 'יצירה', status: 'complete' as const },
    { label: 'הבנת הפרויקט', status: 'active' as const },
    { label: 'סיכום הבנה', status: 'inactive' as const },
    { label: 'פעולה הבאה', status: 'inactive' as const },
  ];

  return (
    <FlowLayout projectName="אפליקציית מסחר אלקטרוני">
      <div className="container max-w-5xl mx-auto p-8 space-y-8">
        <NexusStepper steps={steps} />

        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold">רוצה להבין את הפרויקט שלך</h1>
          <p className="text-muted-foreground text-lg">כמה שאלות קצרות שיעזרו לי להבין טוב יותר</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chat Area */}
          <div className="lg:col-span-2 space-y-4">
            <NexusCard padding="none" className="h-[500px] flex flex-col">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.role === 'user' ? 'justify-start' : 'justify-end'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                        message.role === 'user'
                          ? 'bg-muted text-foreground'
                          : 'bg-gradient-to-l from-primary to-[#3b82f6] text-white'
                      }`}
                    >
                      <p className="text-sm leading-relaxed">{message.content}</p>
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-end">
                    <div className="bg-gradient-to-l from-primary to-[#3b82f6] text-white rounded-2xl px-4 py-3">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Input */}
              <div className="border-t border-border p-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="הקלד את התשובה שלך..."
                    className="flex-1 px-4 py-3 bg-input-background border border-input-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  <NexusButton onClick={handleSend} disabled={!input.trim() || loading}>
                    <Send className="w-4 h-4" />
                  </NexusButton>
                </div>
              </div>
            </NexusCard>

            <div className="flex gap-3">
              <NexusButton
                onClick={() => navigate('/understanding')}
                size="lg"
                className="flex-1"
              >
                המשך לסיכום
              </NexusButton>
              <NexusButton variant="secondary" size="lg">
                <RotateCcw className="w-4 h-4" />
                התחל מחדש
              </NexusButton>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="space-y-4">
            <NexusCard padding="md" className="bg-success/10 border-success/20">
              <div className="flex gap-3">
                <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-semibold text-sm">מה הבנתי</h4>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• קהל יעד: בעלי עסקים קטנים</li>
                    <li>• בעיה: קושי במכירה אונליין</li>
                  </ul>
                </div>
              </div>
            </NexusCard>

            <NexusCard padding="md" className="bg-warning/10 border-warning/20">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-semibold text-sm">מה חסר</h4>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• תהליך העבודה הנוכחי</li>
                    <li>• קריטריוני הצלחה</li>
                  </ul>
                </div>
              </div>
            </NexusCard>
          </div>
        </div>
      </div>
    </FlowLayout>
  );
}

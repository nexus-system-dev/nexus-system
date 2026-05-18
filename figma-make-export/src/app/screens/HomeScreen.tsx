import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Plus, Folder, Clock, ChevronLeft } from 'lucide-react';
import { NexusLayout } from '../components/nexus/NexusLayout';
import { NexusCard } from '../components/nexus/NexusCard';
import { NexusButton } from '../components/nexus/NexusButton';
import { EmptyState } from '../components/nexus/NexusStates';

interface Project {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'paused' | 'completed';
  lastUpdated: string;
}

const mockProjects: Project[] = [
  {
    id: '1',
    name: 'אפליקציית מסחר אלקטרוני',
    description: 'פלטפורמה למכירת מוצרים עם עגלת קניות ותשלומים',
    status: 'active',
    lastUpdated: 'לפני שעתיים',
  },
  {
    id: '2',
    name: 'מערכת ניהול לקוחות',
    description: 'CRM לניהול קשרי לקוחות ומעקב אחר הזדמנויות',
    status: 'active',
    lastUpdated: 'אתמול',
  },
];

export function HomeScreen() {
  const navigate = useNavigate();
  const [projects] = useState<Project[]>(mockProjects);

  const statusConfig = {
    active: { label: 'פעיל', color: 'bg-success/10 text-success' },
    paused: { label: 'מושהה', color: 'bg-warning/10 text-warning' },
    completed: { label: 'הושלם', color: 'bg-muted text-muted-foreground' },
  };

  if (projects.length === 0) {
    return (
      <NexusLayout>
        <div className="container max-w-6xl mx-auto p-8">
          <EmptyState
            title="אין לך פרויקטים עדיין"
            description="התחל בפרויקט הראשון שלך ותן ל-Nexus לעזור לך לבנות אותו"
            action={{
              label: 'צור פרויקט חדש',
              onClick: () => navigate('/create'),
            }}
          />
        </div>
      </NexusLayout>
    );
  }

  return (
    <NexusLayout>
      <div className="container max-w-6xl mx-auto p-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">הבית שלך</h1>
            <p className="text-muted-foreground mt-2">בחר פרויקט קיים או התחל חדש</p>
          </div>

          <NexusButton onClick={() => navigate('/create')} size="lg">
            <Plus className="w-5 h-5" />
            צור פרויקט חדש
          </NexusButton>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((project) => (
            <NexusCard
              key={project.id}
              hover
              className="cursor-pointer group"
              padding="lg"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-[#3b82f6] flex items-center justify-center flex-shrink-0">
                      <Folder className="w-6 h-6 text-white" />
                    </div>

                    <div className="flex-1">
                      <h3 className="text-xl font-semibold group-hover:text-primary transition-colors">
                        {project.name}
                      </h3>
                      <p className="text-muted-foreground mt-1">{project.description}</p>
                    </div>
                  </div>

                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusConfig[project.status].color}`}>
                    {statusConfig[project.status].label}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>עודכן {project.lastUpdated}</span>
                  </div>

                  <button
                    onClick={() => navigate('/loop')}
                    className="flex items-center gap-2 text-sm font-medium text-primary hover:gap-3 transition-all"
                  >
                    <span>פתח פרויקט</span>
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </NexusCard>
          ))}
        </div>
      </div>
    </NexusLayout>
  );
}

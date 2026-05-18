import { Upload, FileText, Image, Download, Trash2, ExternalLink } from 'lucide-react';
import { NexusLayout } from '../components/nexus/NexusLayout';
import { NexusCard } from '../components/nexus/NexusCard';
import { NexusButton } from '../components/nexus/NexusButton';

interface File {
  id: string;
  name: string;
  type: 'document' | 'image' | 'code';
  size: string;
  uploadedAt: string;
  source: string;
}

export function FilesScreen() {
  const files: File[] = [
    {
      id: '1',
      name: 'product-requirements.pdf',
      type: 'document',
      size: '2.4 MB',
      uploadedAt: 'לפני שעתיים',
      source: 'העלאה ידנית',
    },
    {
      id: '2',
      name: 'wireframes-mockup.png',
      type: 'image',
      size: '1.8 MB',
      uploadedAt: 'אתמול',
      source: 'העלאה ידנית',
    },
    {
      id: '3',
      name: 'api-documentation.md',
      type: 'document',
      size: '45 KB',
      uploadedAt: 'לפני יומיים',
      source: 'נוצר ע"י Nexus',
    },
  ];

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <Image className="w-5 h-5 text-primary" />;
      case 'document':
        return <FileText className="w-5 h-5 text-primary" />;
      default:
        return <FileText className="w-5 h-5 text-primary" />;
    }
  };

  return (
    <NexusLayout showProjectSelector projectName="אפליקציית מסחר אלקטרוני">
      <div className="container max-w-5xl mx-auto p-8 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold">קבצים וחומרים</h1>
            <p className="text-muted-foreground text-lg mt-2">
              כל הקבצים והמסמכים הקשורים לפרויקט
            </p>
          </div>

          <NexusButton size="lg">
            <Upload className="w-5 h-5" />
            העלה קבצים
          </NexusButton>
        </div>

        {/* Upload Area */}
        <NexusCard padding="lg">
          <div className="border-2 border-dashed border-border rounded-lg p-12 text-center hover:border-primary/50 hover:bg-accent/30 transition-all cursor-pointer">
            <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-medium text-foreground mb-2">
              גרור קבצים לכאן או לחץ לבחירה
            </p>
            <p className="text-sm text-muted-foreground">
              תומך ב-PDF, DOC, TXT, תמונות, קוד - עד 25MB לקובץ
            </p>
          </div>
        </NexusCard>

        {/* Files List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">הקבצים שלך ({files.length})</h2>
            <div className="flex gap-2">
              <button className="px-4 py-2 text-sm rounded-lg hover:bg-muted transition-colors">
                הכל
              </button>
              <button className="px-4 py-2 text-sm rounded-lg hover:bg-muted transition-colors">
                מסמכים
              </button>
              <button className="px-4 py-2 text-sm rounded-lg hover:bg-muted transition-colors">
                תמונות
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {files.map((file) => (
              <NexusCard key={file.id} padding="lg" hover>
                <div className="flex items-center justify-between gap-6">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      {getFileIcon(file.type)}
                    </div>

                    <div className="flex-1">
                      <h3 className="font-semibold">{file.name}</h3>
                      <div className="flex gap-4 mt-1 text-sm text-muted-foreground">
                        <span>{file.size}</span>
                        <span>•</span>
                        <span>{file.uploadedAt}</span>
                        <span>•</span>
                        <span>{file.source}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                      <ExternalLink className="w-5 h-5 text-muted-foreground" />
                    </button>
                    <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                      <Download className="w-5 h-5 text-muted-foreground" />
                    </button>
                    <button className="p-2 hover:bg-destructive/10 rounded-lg transition-colors">
                      <Trash2 className="w-5 h-5 text-destructive" />
                    </button>
                  </div>
                </div>
              </NexusCard>
            ))}
          </div>
        </div>
      </div>
    </NexusLayout>
  );
}

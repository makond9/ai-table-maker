import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

const Admin = () => {
  const [campaignNameTemplate, setCampaignNameTemplate] = useState('название оффера страна дата имя покупателя');
  const { toast } = useToast();
  
  const availableMacros = [
    { macro: 'дата', description: 'Текущая дата' },
    { macro: 'имя покупателя', description: 'Имя покупателя' },
    { macro: 'название оффера', description: 'Название оффера' },
    { macro: 'тоник аккаунт', description: 'Тоник аккаунт' },
    { macro: 'страна', description: 'Страна' },
    { macro: 'ид кампании', description: 'ID кампании' }
  ];

  const handleSave = () => {
    toast({
      title: "Настройки сохранены",
      description: "Шаблон названия кампании обновлен"
    });
  };

  const insertMacro = (macro: string) => {
    setCampaignNameTemplate(prev => prev + ' ' + macro);
  };

  const previewExample = campaignNameTemplate
    .replace('дата', '2024-01-15')
    .replace('имя покупателя', 'alex_v')
    .replace('название оффера', 'Финансы')
    .replace('тоник аккаунт', 'Мета')
    .replace('страна', 'Россия')
    .replace('ид кампании', 'abc123');

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        <header className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link to="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Назад
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <Settings className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold">Администрирование</h1>
            </div>
          </div>
          <p className="text-muted-foreground">
            Настройте параметры системы и шаблоны для кампаний
          </p>
        </header>

        <div className="max-w-2xl">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-xl">Шаблон названия кампании</CardTitle>
              <CardDescription>Настройте формат автоматического названия</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input 
                value={campaignNameTemplate} 
                onChange={e => setCampaignNameTemplate(e.target.value)} 
                placeholder="Введите шаблон с макросами" 
                className="font-mono text-sm" 
              />

              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">Макросы:</p>
                <div className="flex flex-wrap gap-1">
                  {availableMacros.map(({ macro, description }) => (
                    <Badge 
                      key={macro} 
                      variant="secondary" 
                      className="cursor-pointer hover:bg-secondary/80 text-xs px-2 py-1" 
                      onClick={() => insertMacro(macro)} 
                      title={description}
                    >
                      {macro}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">Пример:</p>
                <div className="p-2 bg-muted rounded text-xs font-mono">
                  {previewExample}
                </div>
              </div>

              <Button onClick={handleSave} size="sm" className="w-full">
                Сохранить
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Admin;
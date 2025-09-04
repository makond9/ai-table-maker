import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, ArrowLeft, Info } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
const Admin = () => {
  const [campaignNameTemplate, setCampaignNameTemplate] = useState('название_оффера_страна_дата_имя_покупателя');
  const {
    toast
  } = useToast();
  const availableMacros = [{
    macro: 'дата',
    description: 'Текущая дата'
  }, {
    macro: 'имя_покупателя',
    description: 'Имя покупателя'
  }, {
    macro: 'название_оффера',
    description: 'Название оффера'
  }, {
    macro: 'трафиковый_аккаунт',
    description: 'Трафиковый аккаунт'
  }, {
    macro: 'страна',
    description: 'Страна'
  }, {
    macro: 'рк',
    description: 'РК'
  }, {
    macro: 'пиксель',
    description: 'Пиксель'
  }, {
    macro: 'ид_кампании',
    description: 'ID кампании'
  }];
  const handleSave = () => {
    toast({
      title: "Настройки сохранены",
      description: "Шаблон названия кампании обновлен"
    });
  };
  const insertMacro = (macro: string) => {
    setCampaignNameTemplate(prev => prev + macro);
  };
  const previewExample = campaignNameTemplate.replace('дата', '2024-01-15').replace('имя_покупателя', 'alex_v').replace('название_оффера', 'Финансы').replace('трафиковый_аккаунт', 'Мета').replace('страна', 'Россия').replace('рк', 'РК-001').replace('пиксель', 'Facebook Pixel').replace('ид_кампании', 'abc123');
  return <div className="min-h-screen bg-background">
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

        <div className="max-w-4xl">
          <Card>
            <CardHeader>
              <CardTitle>Tonic campaign name</CardTitle>
              <CardDescription>Настройте формат автоматического названия кампании в Тоник </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="template">Шаблон названия</Label>
                <Input id="template" value={campaignNameTemplate} onChange={e => setCampaignNameTemplate(e.target.value)} placeholder="Введите шаблон с макросами" className="font-mono" />
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Info className="h-4 w-4 text-muted-foreground" />
                  <Label className="text-sm font-medium">Доступные макросы:</Label>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {availableMacros.map(({
                  macro,
                  description
                }) => <Badge key={macro} variant="secondary" className="cursor-pointer hover:bg-secondary/80 justify-start p-2" onClick={() => insertMacro(macro)} title={description}>
                      {macro}
                    </Badge>)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Нажмите на макрос, чтобы добавить его в шаблон
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Предварительный просмотр:</Label>
                <div className="p-3 bg-muted rounded-md">
                  <code className="text-sm font-mono">{previewExample}</code>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSave}>
                  Сохранить настройки
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>;
};
export default Admin;
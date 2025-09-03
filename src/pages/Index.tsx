import { useState } from 'react';
import { Campaign } from '@/types/campaign';
import { GoogleSheetsTable } from '@/components/GoogleSheetsTable';
import { ChatInterface } from '@/components/ChatInterface';
import { parseMessage, generateAIResponse, parseBulkUpdateCommand, generateBulkUpdateResponse } from '@/utils/aiParser';
import { aiService } from '@/services/aiService';
import { toast } from 'sonner';
import { useToast } from '@/hooks/use-toast';
import { Bot, User, LogOut, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Index = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLaunched, setIsLaunched] = useState(false);
  const { toast } = useToast();

  const handleAIParseMessage = async (message: string) => {
    try {
      const result = await aiService.parseCommandWithAI(message);
      
      if (result.campaigns && result.campaigns.length > 0) {
        // Создание новых кампаний
        const newCampaigns = result.campaigns.map(campaignData => ({
          id: crypto.randomUUID(),
          createdAt: new Date(),
          ...campaignData
        })) as Campaign[];
        
        setCampaigns(prev => [...prev, ...newCampaigns]);
        toast({
          title: "Кампании созданы",
          description: result.message,
        });
        
      } else if (result.bulkUpdate) {
        // Массовое обновление
        setCampaigns(prev => 
          prev.map(campaign => ({
            ...campaign,
            [result.bulkUpdate!.field]: result.bulkUpdate!.value
          }))
        );
        toast({
          title: "Кампании обновлены",
          description: result.message,
        });
        
      } else {
        // Ошибка или неопознанная команда
        toast({
          title: "Ошибка",
          description: result.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('AI parsing error:', error);
      // Fallback на локальный парсинг
      handleSendMessage(message);
    }
  };

  const handleSendMessage = (message: string) => {
    // Проверяем, это команда массового изменения?
    const bulkUpdateCommand = parseBulkUpdateCommand(message);
    
    if (bulkUpdateCommand) {
      // Массовое обновление всех кампаний
      setCampaigns(prev => 
        prev.map(campaign => ({
          ...campaign,
          [bulkUpdateCommand.field]: bulkUpdateCommand.value
        }))
      );
      
      const response = generateBulkUpdateResponse(bulkUpdateCommand, campaigns.length);
      toast({
        title: "Кампании обновлены",
        description: response,
      });
      return;
    }

    // Обычное создание кампаний
    const parsedCampaigns = parseMessage(message);
    
    if (parsedCampaigns.length > 0) {
      const newCampaigns: Campaign[] = parsedCampaigns.map(partial => ({
        id: Date.now().toString() + Math.random(),
        trafficAccount: partial.trafficAccount!,
        offer: partial.offer!,
        country: partial.country!,
        rk: partial.rk || 'РК-001',
        pixel: partial.pixel || 'Facebook Pixel',
        createdAt: new Date()
      }));

      setCampaigns(prev => [...prev, ...newCampaigns]);
      
      const response = generateAIResponse(parsedCampaigns);
      toast({
        title: "Кампании созданы",
        description: response,
      });
    }
  };

  const handleUpdateCampaign = (id: string, updates: Partial<Campaign>) => {
    setCampaigns(prev => 
      prev.map(campaign => 
        campaign.id === id ? { ...campaign, ...updates } : campaign
      )
    );
    toast({
      title: "Кампания обновлена",
      description: "Изменения сохранены",
    });
  };

  const handleDeleteCampaign = (id: string) => {
    setCampaigns(prev => prev.filter(campaign => campaign.id !== id));
    toast({
      title: "Кампания удалена",
      description: "Кампания была удалена из таблицы",
    });
  };

  const handleAddNewRow = () => {
    const newCampaign: Campaign = {
      id: crypto.randomUUID(),
      trafficAccount: 'Мета',
      offer: '',
      country: '',
      rk: 'РК-001',
      pixel: 'Facebook Pixel',
      createdAt: new Date()
    };
    
    setCampaigns(prev => [...prev, newCampaign]);
    toast({
      title: "Новая строка добавлена",
      description: "Заполните данные кампании",
    });
  };

  const handleLaunchCampaigns = () => {
    const launchedCampaigns = campaigns.map(campaign => ({
      ...campaign,
      campaignName: `${campaign.trafficAccount}_${campaign.offer}_${campaign.country}_${campaign.rk}`,
      campaignUrl: `https://campaign.tracker.com/c/${campaign.id}`
    }));
    
    setCampaigns(launchedCampaigns);
    setIsLaunched(true);
    
    toast({
      title: "Кампании запущены",
      description: "Названия и ссылки кампаний созданы",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        <header className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <Bot className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold">AI Менеджер кампаний</h1>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded-lg">
                <User className="h-4 w-4 text-muted-foreground" />
                <div className="flex flex-col">
                  <div className="text-sm font-medium text-foreground">Alex</div>
                  <div className="text-xs text-muted-foreground">alex_v</div>
                </div>
              </div>
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <p className="text-muted-foreground">
            Управляйте рекламными кампаниями с помощью естественного языка
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold mb-2">Таблица кампаний</h2>
                  <p className="text-sm text-muted-foreground">
                    Всего кампаний: {campaigns.length}
                  </p>
                </div>
                <Button
                  onClick={handleAddNewRow}
                  size="icon"
                  className="rounded-full h-10 w-10 bg-primary hover:bg-primary/90"
                >
                  <Plus className="h-5 w-5" />
                </Button>
              </div>
            </div>
            <GoogleSheetsTable
              campaigns={campaigns}
              onUpdateCampaign={handleUpdateCampaign}
              onDeleteCampaign={handleDeleteCampaign}
              isLaunched={isLaunched}
            />
          </div>

          <div className="lg:col-span-1">
            <div className="h-[600px]">
          <ChatInterface 
            onSendMessage={handleSendMessage}
            onLaunchCampaigns={handleLaunchCampaigns}
            hasCampaigns={campaigns.length > 0}
            onAIParseMessage={handleAIParseMessage}
          />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;

import { useState } from 'react';
import { Campaign } from '@/types/campaign';
import { CampaignTable } from '@/components/CampaignTable';
import { ChatInterface } from '@/components/ChatInterface';
import { parseMessage, generateAIResponse, parseBulkUpdateCommand, generateBulkUpdateResponse } from '@/utils/aiParser';
import { useToast } from '@/hooks/use-toast';
import { Bot } from 'lucide-react';

const Index = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLaunched, setIsLaunched] = useState(false);
  const [selectedCampaigns, setSelectedCampaigns] = useState<string[]>([]);
  const { toast } = useToast();

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

  const handleBulkUpdate = (updates: Partial<Campaign>) => {
    setCampaigns(prev => 
      prev.map(campaign => 
        selectedCampaigns.includes(campaign.id) 
          ? { ...campaign, ...updates }
          : campaign
      )
    );
    
    // Очищаем выбор после обновления
    setSelectedCampaigns([]);
    
    toast({
      title: "Кампании обновлены",
      description: `Обновлено ${selectedCampaigns.length} кампаний`,
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
          <div className="flex items-center gap-3 mb-2">
            <Bot className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">AI Менеджер кампаний</h1>
          </div>
          <p className="text-muted-foreground">
            Управляйте рекламными кампаниями с помощью естественного языка
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="mb-4">
              <h2 className="text-xl font-semibold mb-2">Таблица кампаний</h2>
              <p className="text-sm text-muted-foreground">
                Всего кампаний: {campaigns.length}
              </p>
            </div>
            <CampaignTable
              campaigns={campaigns}
              onUpdateCampaign={handleUpdateCampaign}
              onDeleteCampaign={handleDeleteCampaign}
              isLaunched={isLaunched}
              selectedCampaigns={selectedCampaigns}
              onSelectionChange={setSelectedCampaigns}
              onBulkUpdate={handleBulkUpdate}
            />
          </div>

          <div className="lg:col-span-1">
            <div className="h-[600px]">
              <ChatInterface 
                onSendMessage={handleSendMessage} 
                onLaunchCampaigns={handleLaunchCampaigns}
                hasCampaigns={campaigns.length > 0}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;

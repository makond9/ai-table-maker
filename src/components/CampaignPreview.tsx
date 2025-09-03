import { Campaign } from '@/types/campaign';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Check, X, Edit3, Zap } from 'lucide-react';

interface CampaignPreviewProps {
  campaigns: Campaign[];
  onConfirm: () => void;
  onCancel: () => void;
  onEdit?: () => void;
}

export function CampaignPreview({ campaigns, onConfirm, onCancel, onEdit }: CampaignPreviewProps) {
  const completeCampaigns = campaigns.filter(c => 
    c.trafficAccount && c.offer && c.country && c.rk && c.pixel
  );
  const incompleteCampaigns = campaigns.filter(c => 
    !c.trafficAccount || !c.offer || !c.country || !c.rk || !c.pixel
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2 text-primary">
          <Zap className="h-5 w-5" />
          <h2 className="text-xl font-semibold">AI Ассистент готов к работе</h2>
        </div>
        <p className="text-muted-foreground">
          Проверьте параметры кампаний перед созданием
        </p>
      </div>

      {/* Complete Campaigns */}
      {completeCampaigns.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-medium text-green-600 flex items-center gap-2">
            <Check className="h-4 w-4" />
            Готовые к запуску ({completeCampaigns.length})
          </h3>
          
          <div className="space-y-2">
            {completeCampaigns.map((campaign, index) => (
              <Card key={campaign.id} className="p-4 border-green-200 bg-green-50/50">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="font-medium text-sm">
                      Кампания #{index + 1}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <span className="inline-block bg-primary/10 text-primary px-2 py-1 rounded text-xs mr-2">
                        {campaign.trafficAccount}
                      </span>
                      <span className="inline-block bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs mr-2">
                        {campaign.offer}
                      </span>
                      <span className="inline-block bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs mr-2">
                        {campaign.country}
                      </span>
                      <span className="inline-block bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs mr-2">
                        {campaign.rk}
                      </span>
                      <span className="inline-block bg-green-100 text-green-700 px-2 py-1 rounded text-xs">
                        {campaign.pixel}
                      </span>
                    </div>
                  </div>
                  <Check className="h-5 w-5 text-green-600" />
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Incomplete Campaigns */}
      {incompleteCampaigns.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-medium text-orange-600 flex items-center gap-2">
            <Edit3 className="h-4 w-4" />
            Требуют уточнения ({incompleteCampaigns.length})
          </h3>
          
          <div className="space-y-2">
            {incompleteCampaigns.map((campaign, index) => (
              <Card key={campaign.id} className="p-4 border-orange-200 bg-orange-50/50">
                <div className="space-y-2">
                  <div className="font-medium text-sm">
                    Кампания #{completeCampaigns.length + index + 1}
                  </div>
                  <div className="text-sm">
                    <div className="flex flex-wrap gap-1">
                      <span className={`inline-block px-2 py-1 rounded text-xs ${
                        campaign.trafficAccount 
                          ? 'bg-primary/10 text-primary' 
                          : 'bg-gray-100 text-gray-500 border border-dashed'
                      }`}>
                        {campaign.trafficAccount || 'Трафик-источник'}
                      </span>
                      <span className={`inline-block px-2 py-1 rounded text-xs ${
                        campaign.offer 
                          ? 'bg-blue-100 text-blue-700' 
                          : 'bg-gray-100 text-gray-500 border border-dashed'
                      }`}>
                        {campaign.offer || 'Оффер'}
                      </span>
                      <span className={`inline-block px-2 py-1 rounded text-xs ${
                        campaign.country 
                          ? 'bg-purple-100 text-purple-700' 
                          : 'bg-gray-100 text-gray-500 border border-dashed'
                      }`}>
                        {campaign.country || 'Страна'}
                      </span>
                      <span className={`inline-block px-2 py-1 rounded text-xs ${
                        campaign.rk 
                          ? 'bg-orange-100 text-orange-700' 
                          : 'bg-gray-100 text-gray-500 border border-dashed'
                      }`}>
                        {campaign.rk || 'РК'}
                      </span>
                      <span className={`inline-block px-2 py-1 rounded text-xs ${
                        campaign.pixel 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-gray-100 text-gray-500 border border-dashed'
                      }`}>
                        {campaign.pixel || 'Пиксель'}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Action Summary */}
      <Card className="p-4 bg-primary/5 border-primary/20">
        <div className="space-y-2">
          <h4 className="font-medium text-primary">Что будет сделано:</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            {completeCampaigns.length > 0 && (
              <li>✅ Создать {completeCampaigns.length} готовых кампаний в Тоник</li>
            )}
            {incompleteCampaigns.length > 0 && (
              <li>⏳ Добавить {incompleteCampaigns.length} черновиков для дальнейшего редактирования</li>
            )}
            <li>🔗 Сгенерировать ссылки кампаний в КликФелер</li>
            <li>📊 Создать таблицу для управления кампаниями</li>
          </ul>
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-center gap-3">
        <Button
          variant="outline"
          onClick={onCancel}
          className="flex items-center gap-2"
        >
          <X className="h-4 w-4" />
          Отменить
        </Button>
        
        {onEdit && incompleteCampaigns.length > 0 && (
          <Button
            variant="secondary"
            onClick={onEdit}
            className="flex items-center gap-2"
          >
            <Edit3 className="h-4 w-4" />
            Уточнить параметры
          </Button>
        )}
        
        <Button
          onClick={onConfirm}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
        >
          <Check className="h-4 w-4" />
          Подтвердить создание
        </Button>
      </div>
    </div>
  );
}
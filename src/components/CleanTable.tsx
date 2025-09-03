import { Campaign } from '@/types/campaign';
import { Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CampaignLinkStatus } from './CampaignLinkStatus';

interface CleanTableProps {
  campaigns: Campaign[];
  onUpdateCampaign: (id: string, updates: Partial<Campaign>) => void;
  onDeleteCampaign: (id: string) => void;
  isLaunched?: boolean;
}

export function CleanTable({ campaigns, onUpdateCampaign, onDeleteCampaign, isLaunched = false }: CleanTableProps) {
  if (campaigns.length === 0) {
    return (
      <div className="text-center py-16 px-4">
        <div className="max-w-md mx-auto">
          <h3 className="text-lg font-medium text-foreground mb-2">
            Пока нет кампаний
          </h3>
          <p className="text-muted-foreground text-sm">
            Используйте чат ниже, чтобы создать ваши первые кампании.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Заголовок секции "Управление кампаниями" */}
      <div className="bg-primary text-white px-6 py-4 rounded-lg">
        <h2 className="text-xl font-semibold">Управление кампаниями</h2>
      </div>

      {/* Заголовок секции "Кампании" */}
      <div className="bg-primary text-white px-6 py-3 rounded-lg">
        <h3 className="text-lg font-semibold">Кампании</h3>
      </div>

      {/* Таблица */}
      <div className="bg-white rounded-lg border border-table-border overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-table-header border-b border-table-border">
              {isLaunched ? (
                <>
                  <th className="text-left py-4 px-6 font-semibold text-foreground">Name</th>
                  <th className="text-left py-4 px-6 font-semibold text-foreground">Offer</th>
                  <th className="text-left py-4 px-6 font-semibold text-foreground">Country</th>
                  <th className="text-left py-4 px-6 font-semibold text-foreground">Status</th>
                </>
              ) : (
                <>
                  <th className="text-left py-4 px-6 font-semibold text-foreground">Трафик-источник</th>
                  <th className="text-left py-4 px-6 font-semibold text-foreground">Оффер</th>
                  <th className="text-left py-4 px-6 font-semibold text-foreground">Страна</th>
                  <th className="text-left py-4 px-6 font-semibold text-foreground">РК</th>
                  <th className="text-left py-4 px-6 font-semibold text-foreground">Пиксель</th>
                  <th className="text-left py-4 px-6 font-semibold text-foreground">Действия</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {campaigns.map((campaign, index) => (
              <tr 
                key={campaign.id} 
                className="border-b border-table-border hover:bg-table-row-hover transition-colors"
              >
                {isLaunched ? (
                  <>
                    <td className="py-4 px-6 text-foreground">
                      {campaign.campaignName || 'Новая кампания'}
                    </td>
                    <td className="py-4 px-6 text-foreground">
                      {campaign.offer || 'Не указан'}
                    </td>
                    <td className="py-4 px-6 text-foreground">
                      {campaign.country || 'Не указана'}
                    </td>
                    <td className="py-4 px-6">
                      <CampaignLinkStatus campaignId={campaign.id} />
                    </td>
                  </>
                ) : (
                  <>
                    <td className="py-4 px-6 text-foreground">
                      {campaign.trafficAccount || 'Нужно уточнить'}
                    </td>
                    <td className="py-4 px-6 text-foreground">
                      {campaign.offer || 'Нужно уточнить'}
                    </td>
                    <td className="py-4 px-6 text-foreground">
                      {campaign.country || 'Нужно уточнить'}
                    </td>
                    <td className="py-4 px-6 text-foreground">
                      {campaign.rk || 'Нужно уточнить'}
                    </td>
                    <td className="py-4 px-6 text-foreground">
                      {campaign.pixel || 'Нужно уточнить'}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {/* TODO: implement edit */}}
                          className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onDeleteCampaign(campaign.id)}
                          className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
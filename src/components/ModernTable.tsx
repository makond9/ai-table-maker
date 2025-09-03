import { Campaign } from '@/types/campaign';
import { Button } from '@/components/ui/button';
import { Trash2, Edit, Copy } from 'lucide-react';
import { CampaignLinkStatus } from './CampaignLinkStatus';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface ModernTableProps {
  campaigns: Campaign[];
  onUpdateCampaign: (id: string, updates: Partial<Campaign>) => void;
  onDeleteCampaign: (id: string) => void;
  isLaunched: boolean;
}

export function ModernTable({ campaigns, onUpdateCampaign, onDeleteCampaign, isLaunched }: ModernTableProps) {
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const { toast } = useToast();

  const columns = isLaunched 
    ? [
        { key: 'campaignName' as keyof Campaign, label: 'Название кампании' },
        { key: 'campaignUrl' as keyof Campaign, label: 'Ссылка в КликФелер' }
      ]
    : [
        { key: 'trafficAccount' as keyof Campaign, label: 'Трафик-источник' },
        { key: 'offer' as keyof Campaign, label: 'Оффер' },
        { key: 'country' as keyof Campaign, label: 'Страна' },
        { key: 'rk' as keyof Campaign, label: 'РК' },
        { key: 'pixel' as keyof Campaign, label: 'Пиксель' }
      ];

  const handleRowSelect = (campaignId: string) => {
    setSelectedRows(prev => 
      prev.includes(campaignId) 
        ? prev.filter(id => id !== campaignId)
        : [...prev, campaignId]
    );
  };

  const handleSelectAll = () => {
    setSelectedRows(selectedRows.length === campaigns.length ? [] : campaigns.map(c => c.id));
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-table-card rounded-lg border border-table-card-border" style={{ boxShadow: 'var(--table-shadow)' }}>
        <div className="flex items-center gap-4">
          <button 
            onClick={handleSelectAll}
            className="w-5 h-5 border-2 border-table-accent rounded flex items-center justify-center transition-colors hover:bg-table-accent/10"
          >
            {selectedRows.length === campaigns.length && campaigns.length > 0 && (
              <div className="w-3 h-3 bg-table-accent rounded-sm" />
            )}
          </button>
          <h3 className="text-lg font-semibold text-table-header-modern">
            Кампании ({campaigns.length})
          </h3>
        </div>
        
        {selectedRows.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Выбрано: {selectedRows.length}
            </span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setSelectedRows([])}
            >
              Отменить
            </Button>
          </div>
        )}
      </div>

      {/* Column Headers */}
      <div className="grid gap-4" style={{ gridTemplateColumns: `40px repeat(${columns.length}, 1fr) ${!isLaunched ? '100px' : ''}` }}>
        <div></div>
        {columns.map((col) => (
          <div key={col.key} className="px-4 py-2 text-sm font-medium text-table-header-modern">
            {col.label}
          </div>
        ))}
        {!isLaunched && (
          <div className="px-4 py-2 text-sm font-medium text-table-header-modern text-center">
            Действия
          </div>
        )}
      </div>

      {/* Rows */}
      <div className="space-y-3">
        {campaigns.map((campaign, index) => (
          <div
            key={campaign.id}
            className={`
              grid gap-4 p-4 bg-table-card rounded-lg border border-table-card-border transition-all duration-200
              ${selectedRows.includes(campaign.id) ? 'bg-table-card-selected border-table-accent' : 'hover:bg-table-card-hover'}
            `}
            style={{ 
              gridTemplateColumns: `40px repeat(${columns.length}, 1fr) ${!isLaunched ? '100px' : ''}`,
              boxShadow: selectedRows.includes(campaign.id) ? 'var(--table-shadow-hover)' : 'var(--table-shadow)'
            }}
          >
            {/* Row Number & Checkbox */}
            <div className="flex items-center gap-2">
              <button 
                onClick={() => handleRowSelect(campaign.id)}
                className="w-5 h-5 border-2 border-table-accent rounded flex items-center justify-center transition-colors hover:bg-table-accent/10"
              >
                {selectedRows.includes(campaign.id) && (
                  <div className="w-3 h-3 bg-table-accent rounded-sm" />
                )}
              </button>
              <span className="text-xs text-muted-foreground font-mono">
                {String(index + 1).padStart(2, '0')}
              </span>
            </div>

            {/* Data Columns */}
            {columns.map((col) => (
              <div key={col.key} className="flex items-center px-2 py-1">
                {col.key === 'campaignUrl' ? (
                  <CampaignLinkStatus campaignId={campaign.id} />
                ) : (
                  <div className="w-full">
                    <span className={`text-sm ${campaign[col.key] ? 'text-foreground' : 'text-muted-foreground italic'}`}>
                      {campaign[col.key] ? String(campaign[col.key]) : 'Нужно уточнить'}
                    </span>
                  </div>
                )}
              </div>
            ))}

            {/* Actions */}
            {!isLaunched && (
              <div className="flex items-center justify-center gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0 hover:bg-table-accent/10"
                  onClick={() => {
                    // Open edit dialog logic here
                    toast({
                      title: "Редактирование",
                      description: "Функция редактирования строки",
                    });
                  }}
                >
                  <Edit className="h-4 w-4 text-table-accent" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0 hover:bg-destructive/10"
                  onClick={() => onDeleteCampaign(campaign.id)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>

      {campaigns.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <div className="text-lg mb-2">Нет кампаний</div>
          <div className="text-sm">Создайте свою первую кампанию через чат</div>
        </div>
      )}
    </div>
  );
}
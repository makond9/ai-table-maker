import { useState } from 'react';
import { Campaign, TRAFFIC_ACCOUNTS, OFFERS, COUNTRIES, RK_OPTIONS, PIXEL_OPTIONS } from '@/types/campaign';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Edit2, Save, X, Copy, Edit } from 'lucide-react';
import { BulkEditDialog } from './BulkEditDialog';

interface CampaignTableProps {
  campaigns: Campaign[];
  onUpdateCampaign: (id: string, updates: Partial<Campaign>) => void;
  onDeleteCampaign: (id: string) => void;
  isLaunched?: boolean;
  selectedCampaigns: string[];
  onSelectionChange: (selectedIds: string[]) => void;
  onBulkUpdate: (updates: Partial<Campaign>) => void;
}

export function CampaignTable({ campaigns, onUpdateCampaign, onDeleteCampaign, isLaunched = false, selectedCampaigns, onSelectionChange, onBulkUpdate }: CampaignTableProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Campaign>>({});
  const [bulkEditOpen, setBulkEditOpen] = useState(false);
  const [lastSelectedIndex, setLastSelectedIndex] = useState<number>(-1);

  const startEdit = (campaign: Campaign) => {
    setEditingId(campaign.id);
    setEditForm({
      trafficAccount: campaign.trafficAccount,
      offer: campaign.offer,
      country: campaign.country,
      rk: campaign.rk,
      pixel: campaign.pixel
    });
  };

  const saveEdit = () => {
    if (editingId && editForm) {
      onUpdateCampaign(editingId, editForm);
      setEditingId(null);
      setEditForm({});
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleRowClick = (campaign: Campaign, index: number, event: React.MouseEvent) => {
    // Предотвращаем выбор если кликнули на кнопку редактирования или удаления
    if ((event.target as HTMLElement).closest('button')) {
      return;
    }

    const campaignId = campaign.id;
    
    if (event.ctrlKey || event.metaKey) {
      // Ctrl+клик: добавить/убрать из выбора
      const newSelection = selectedCampaigns.includes(campaignId)
        ? selectedCampaigns.filter(id => id !== campaignId)
        : [...selectedCampaigns, campaignId];
      onSelectionChange(newSelection);
      setLastSelectedIndex(index);
    } else if (event.shiftKey && lastSelectedIndex !== -1) {
      // Shift+клик: выбрать диапазон
      const startIndex = Math.min(lastSelectedIndex, index);
      const endIndex = Math.max(lastSelectedIndex, index);
      const rangeIds = campaigns.slice(startIndex, endIndex + 1).map(c => c.id);
      
      const newSelection = [...new Set([...selectedCampaigns, ...rangeIds])];
      onSelectionChange(newSelection);
    } else {
      // Обычный клик: выбрать только эту кампанию
      onSelectionChange([campaignId]);
      setLastSelectedIndex(index);
    }
  };

  const getSelectedCampaigns = () => {
    return campaigns.filter(campaign => selectedCampaigns.includes(campaign.id));
  };

  return (
    <div className="rounded-lg border border-table-border bg-card overflow-hidden">
      {/* Панель массового редактирования */}
      {selectedCampaigns.length > 0 && !isLaunched && (
        <div className="bg-blue-50 dark:bg-blue-950 border-b border-table-border p-4 flex items-center justify-between">
          <span className="text-sm font-medium">
            Выбрано кампаний: {selectedCampaigns.length}
          </span>
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => setBulkEditOpen(true)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Редактировать
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => onSelectionChange([])}
            >
              Отменить выбор
            </Button>
          </div>
        </div>
      )}

      {isLaunched ? (
        // Режим запущенных кампаний - только названия и ссылки
        <>
          <div className="bg-table-header border-b border-table-border">
            <div className="grid grid-cols-2 gap-4 p-4 font-medium text-sm text-muted-foreground">
              <div>Название кампании</div>
              <div>Ссылка на кампанию</div>
            </div>
          </div>
          <div className="divide-y divide-table-border">
            {campaigns.map((campaign, index) => (
              <div
                key={campaign.id}
                className="grid grid-cols-2 gap-4 p-4 hover:bg-table-row-hover transition-colors"
                onClick={(e) => handleRowClick(campaign, index, e)}
              >
                <div className="flex items-center">
                  <span className="font-medium">{campaign.campaignName}</span>
                </div>
                <div className="flex items-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(campaign.campaignUrl!);
                    }}
                    className="flex items-center gap-2"
                  >
                    <Copy className="h-4 w-4" />
                    <span className="text-sm">{campaign.campaignUrl}</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        // Обычный режим - все колонки
        <>
          <div className="bg-table-header border-b border-table-border">
            <div className="grid grid-cols-7 gap-4 p-4 font-medium text-sm text-muted-foreground">
              <div>Трафик аккаунт</div>
              <div>Оффер</div>
              <div>Страна</div>
              <div>РК</div>
              <div>Пиксель</div>
              <div>Создано</div>
              <div>Действия</div>
            </div>
          </div>

          <div className="divide-y divide-table-border">
            {campaigns.map((campaign, index) => {
              const isSelected = selectedCampaigns.includes(campaign.id);
              return (
                <div
                  key={campaign.id}
                  className={`grid grid-cols-7 gap-4 p-4 hover:bg-table-row-hover transition-colors cursor-pointer ${
                    isSelected ? 'bg-blue-50 dark:bg-blue-950 border-l-4 border-l-blue-500' : ''
                  }`}
                  onClick={(e) => handleRowClick(campaign, index, e)}
                >
                <div className="flex items-center">
                  {editingId === campaign.id ? (
                    <Select
                      value={editForm.trafficAccount}
                      onValueChange={(value) =>
                        setEditForm({ ...editForm, trafficAccount: value as Campaign['trafficAccount'] })
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TRAFFIC_ACCOUNTS.map((account) => (
                          <SelectItem key={account} value={account}>
                            {account}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <span className="font-medium">{campaign.trafficAccount}</span>
                  )}
                </div>

                <div className="flex items-center">
                  {editingId === campaign.id ? (
                    <Select
                      value={editForm.offer}
                      onValueChange={(value) => setEditForm({ ...editForm, offer: value })}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {OFFERS.map((offer) => (
                          <SelectItem key={offer} value={offer}>
                            {offer}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <span>{campaign.offer}</span>
                  )}
                </div>

                <div className="flex items-center">
                  {editingId === campaign.id ? (
                    <Select
                      value={editForm.country}
                      onValueChange={(value) => setEditForm({ ...editForm, country: value })}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {COUNTRIES.map((country) => (
                          <SelectItem key={country} value={country}>
                            {country}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <span>{campaign.country}</span>
                  )}
                </div>

                <div className="flex items-center">
                  {editingId === campaign.id ? (
                    <Select
                      value={editForm.rk}
                      onValueChange={(value) => setEditForm({ ...editForm, rk: value })}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {RK_OPTIONS.map((rk) => (
                          <SelectItem key={rk} value={rk}>
                            {rk}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <span>{campaign.rk}</span>
                  )}
                </div>

                <div className="flex items-center">
                  {editingId === campaign.id ? (
                    <Select
                      value={editForm.pixel}
                      onValueChange={(value) => setEditForm({ ...editForm, pixel: value })}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PIXEL_OPTIONS.map((pixel) => (
                          <SelectItem key={pixel} value={pixel}>
                            {pixel}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <span>{campaign.pixel}</span>
                  )}
                </div>

                <div className="flex items-center text-sm text-muted-foreground">
                  {campaign.createdAt.toLocaleDateString('ru-RU')}
                </div>

                <div className="flex items-center gap-2">
                  {editingId === campaign.id ? (
                    <>
                      <Button size="sm" variant="default" onClick={saveEdit}>
                        <Save className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={cancelEdit}>
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button size="sm" variant="outline" onClick={() => startEdit(campaign)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => onDeleteCampaign(campaign.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {campaigns.length === 0 && (
        <div className="p-8 text-center text-muted-foreground">
          <p>Нет кампаний. Начните добавлять их через чат!</p>
        </div>
      )}

      <BulkEditDialog
        open={bulkEditOpen}
        onOpenChange={setBulkEditOpen}
        selectedCampaigns={getSelectedCampaigns()}
        onBulkUpdate={onBulkUpdate}
      />
    </div>
  );
}
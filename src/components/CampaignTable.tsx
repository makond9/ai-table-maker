import { useState } from 'react';
import { Campaign, TRAFFIC_ACCOUNTS, OFFERS, COUNTRIES, RK_OPTIONS, PIXEL_OPTIONS } from '@/types/campaign';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Edit2, Save, X } from 'lucide-react';

interface CampaignTableProps {
  campaigns: Campaign[];
  onUpdateCampaign: (id: string, updates: Partial<Campaign>) => void;
  onDeleteCampaign: (id: string) => void;
}

export function CampaignTable({ campaigns, onUpdateCampaign, onDeleteCampaign }: CampaignTableProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Campaign>>({});

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

  return (
    <div className="rounded-lg border border-table-border bg-card overflow-hidden">
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
        {campaigns.map((campaign) => (
          <div
            key={campaign.id}
            className="grid grid-cols-7 gap-4 p-4 hover:bg-table-row-hover transition-colors"
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
        ))}
      </div>

      {campaigns.length === 0 && (
        <div className="p-8 text-center text-muted-foreground">
          <p>Нет кампаний. Начните добавлять их через чат!</p>
        </div>
      )}
    </div>
  );
}
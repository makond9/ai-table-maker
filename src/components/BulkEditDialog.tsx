import { useState, useEffect } from 'react';
import { Campaign, TRAFFIC_ACCOUNTS, OFFERS, COUNTRIES, RK_OPTIONS, PIXEL_OPTIONS } from '@/types/campaign';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

interface BulkEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCampaigns: Campaign[];
  onBulkUpdate: (updates: Partial<Campaign>) => void;
}

export function BulkEditDialog({ open, onOpenChange, selectedCampaigns, onBulkUpdate }: BulkEditDialogProps) {
  const [updates, setUpdates] = useState<Partial<Campaign>>({});

  // Сброс формы при открытии
  useEffect(() => {
    if (open) {
      setUpdates({});
    }
  }, [open]);

  const handleSave = () => {
    onBulkUpdate(updates);
    onOpenChange(false);
  };

  const getCommonValue = (field: keyof Campaign): string | undefined => {
    if (selectedCampaigns.length === 0) return undefined;
    
    const firstValue = selectedCampaigns[0][field];
    const allSame = selectedCampaigns.every(campaign => campaign[field] === firstValue);
    
    return allSame ? String(firstValue) : undefined;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            Массовое редактирование ({selectedCampaigns.length} кампаний)
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="trafficAccount">Трафик аккаунт</Label>
            <Select
              value={updates.trafficAccount || getCommonValue('trafficAccount') || ''}
              onValueChange={(value) => setUpdates(prev => ({ ...prev, trafficAccount: value as Campaign['trafficAccount'] }))}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Выберите трафик аккаунт" />
              </SelectTrigger>
              <SelectContent>
                {TRAFFIC_ACCOUNTS.map((account) => (
                  <SelectItem key={account} value={account}>
                    {account}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="offer">Оффер</Label>
            <Select
              value={updates.offer || getCommonValue('offer') || ''}
              onValueChange={(value) => setUpdates(prev => ({ ...prev, offer: value }))}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Выберите оффер" />
              </SelectTrigger>
              <SelectContent>
                {OFFERS.map((offer) => (
                  <SelectItem key={offer} value={offer}>
                    {offer}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="country">Страна</Label>
            <Select
              value={updates.country || getCommonValue('country') || ''}
              onValueChange={(value) => setUpdates(prev => ({ ...prev, country: value }))}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Выберите страну" />
              </SelectTrigger>
              <SelectContent>
                {COUNTRIES.map((country) => (
                  <SelectItem key={country} value={country}>
                    {country}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="rk">РК</Label>
            <Select
              value={updates.rk || getCommonValue('rk') || ''}
              onValueChange={(value) => setUpdates(prev => ({ ...prev, rk: value }))}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Выберите РК" />
              </SelectTrigger>
              <SelectContent>
                {RK_OPTIONS.map((rk) => (
                  <SelectItem key={rk} value={rk}>
                    {rk}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="pixel">Пиксель</Label>
            <Select
              value={updates.pixel || getCommonValue('pixel') || ''}
              onValueChange={(value) => setUpdates(prev => ({ ...prev, pixel: value }))}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Выберите пиксель" />
              </SelectTrigger>
              <SelectContent>
                {PIXEL_OPTIONS.map((pixel) => (
                  <SelectItem key={pixel} value={pixel}>
                    {pixel}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Отмена
          </Button>
          <Button onClick={handleSave}>
            Применить изменения
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
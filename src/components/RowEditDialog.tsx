import { useState, useEffect } from 'react';
import { Campaign, TONIC_ACCOUNTS, OFFERS, COUNTRIES } from '@/types/campaign';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';

interface RowEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaign: Campaign | null;
  onSave: (campaignId: string, updates: Partial<Campaign>) => void;
}

export function RowEditDialog({ open, onOpenChange, campaign, onSave }: RowEditDialogProps) {
  const [formData, setFormData] = useState<Partial<Campaign>>({});

  useEffect(() => {
    if (campaign) {
      setFormData({
        tonicAccount: campaign.tonicAccount,
        offer: campaign.offer,
        country: campaign.country
      });
    }
  }, [campaign]);

  const handleSave = () => {
    if (campaign) {
      onSave(campaign.id, formData);
      onOpenChange(false);
    }
  };

  const handleFieldChange = (field: keyof Campaign, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!campaign) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Редактировать кампанию</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="tonicAccount">Тоник аккаунт</Label>
            <Select
              value={formData.tonicAccount}
              onValueChange={(value) => handleFieldChange('tonicAccount', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Выберите тоник аккаунт" />
              </SelectTrigger>
              <SelectContent>
                {TONIC_ACCOUNTS.map((account) => (
                  <SelectItem key={account} value={account}>
                    {account}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="offer">Оффер</Label>
            <Select
              value={formData.offer}
              onValueChange={(value) => handleFieldChange('offer', value)}
            >
              <SelectTrigger>
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

          <div className="space-y-2">
            <Label htmlFor="country">Страна</Label>
            <Select
              value={formData.country}
              onValueChange={(value) => handleFieldChange('country', value)}
            >
              <SelectTrigger>
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
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Отмена
          </Button>
          <Button onClick={handleSave}>
            Сохранить
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
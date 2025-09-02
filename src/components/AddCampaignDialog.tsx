import { useState } from 'react';
import { Campaign, TRAFFIC_ACCOUNTS, OFFERS, COUNTRIES } from '@/types/campaign';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';

interface AddCampaignDialogProps {
  onAddCampaign: (campaign: Omit<Campaign, 'id' | 'createdAt'>) => void;
}

export function AddCampaignDialog({ onAddCampaign }: AddCampaignDialogProps) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    trafficAccount: '' as Campaign['trafficAccount'] | '',
    offer: '',
    country: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (form.trafficAccount && form.offer && form.country) {
      onAddCampaign({
        trafficAccount: form.trafficAccount as Campaign['trafficAccount'],
        offer: form.offer,
        country: form.country
      });
      
      // Reset form
      setForm({
        trafficAccount: '',
        offer: '',
        country: ''
      });
      
      setOpen(false);
    }
  };

  const isValid = form.trafficAccount && form.offer && form.country;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Добавить кампанию
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Создать новую кампанию</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="trafficAccount">Трафик аккаунт</Label>
            <Select
              value={form.trafficAccount}
              onValueChange={(value) => setForm({ ...form, trafficAccount: value as Campaign['trafficAccount'] })}
            >
              <SelectTrigger>
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

          <div className="space-y-2">
            <Label htmlFor="offer">Оффер</Label>
            <Select
              value={form.offer}
              onValueChange={(value) => setForm({ ...form, offer: value })}
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
              value={form.country}
              onValueChange={(value) => setForm({ ...form, country: value })}
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

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Отмена
            </Button>
            <Button type="submit" disabled={!isValid}>
              Создать кампанию
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
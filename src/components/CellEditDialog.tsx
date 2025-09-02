import { useState } from 'react';
import { Campaign, TRAFFIC_ACCOUNTS, OFFERS, COUNTRIES, RK_OPTIONS, PIXEL_OPTIONS } from '@/types/campaign';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

interface CellEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCells: Array<{ rowId: string; field: keyof Campaign }>;
  campaigns: Campaign[];
  onCellUpdate: (updates: Array<{ rowId: string; field: keyof Campaign; value: any }>) => void;
}

export function CellEditDialog({ open, onOpenChange, selectedCells, campaigns, onCellUpdate }: CellEditDialogProps) {
  const [newValue, setNewValue] = useState<string>('');

  // Определяем тип поля для редактирования
  const getFieldType = (): keyof Campaign | null => {
    if (selectedCells.length === 0) return null;
    
    const firstField = selectedCells[0].field;
    const allSameField = selectedCells.every(cell => cell.field === firstField);
    
    return allSameField ? firstField : null;
  };

  const fieldType = getFieldType();

  const handleSave = () => {
    if (!newValue || !fieldType) return;

    const updates = selectedCells.map(cell => ({
      rowId: cell.rowId,
      field: cell.field,
      value: newValue
    }));

    onCellUpdate(updates);
    onOpenChange(false);
    setNewValue('');
  };

  const getFieldOptions = (field: keyof Campaign) => {
    switch (field) {
      case 'trafficAccount':
        return TRAFFIC_ACCOUNTS;
      case 'offer':
        return OFFERS;
      case 'country':
        return COUNTRIES;
      case 'rk':
        return RK_OPTIONS;
      case 'pixel':
        return PIXEL_OPTIONS;
      default:
        return [];
    }
  };

  const getFieldLabel = (field: keyof Campaign) => {
    const labels = {
      trafficAccount: 'Трафик аккаунт',
      offer: 'Оффер',
      country: 'Страна',
      rk: 'РК',
      pixel: 'Пиксель'
    };
    return labels[field] || field;
  };

  if (!fieldType) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ошибка</DialogTitle>
          </DialogHeader>
          <p>Можно редактировать только ячейки одного типа одновременно.</p>
          <DialogFooter>
            <Button onClick={() => onOpenChange(false)}>Закрыть</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>
            Редактировать {getFieldLabel(fieldType)} ({selectedCells.length} ячеек)
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="col-span-1">{getFieldLabel(fieldType)}</Label>
            <Select value={newValue} onValueChange={setNewValue}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder={`Выберите ${getFieldLabel(fieldType).toLowerCase()}`} />
              </SelectTrigger>
              <SelectContent>
                {getFieldOptions(fieldType).map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
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
          <Button onClick={handleSave} disabled={!newValue}>
            Применить к {selectedCells.length} ячейкам
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
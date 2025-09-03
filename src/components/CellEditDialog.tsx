import { useState, useEffect } from 'react';
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
  const [updates, setUpdates] = useState<Record<keyof Campaign, string>>({} as Record<keyof Campaign, string>);

  // Сброс формы при открытии
  useEffect(() => {
    if (open) {
      setUpdates({} as Record<keyof Campaign, string>);
    }
  }, [open]);

  // Получаем уникальные типы полей из выбранных ячеек
  const getUniqueFields = (): (keyof Campaign)[] => {
    const fields = selectedCells.map(cell => cell.field);
    return [...new Set(fields)];
  };

  // Получаем уникальные ID строк из выбранных ячеек
  const getAffectedRowIds = (): string[] => {
    const rowIds = selectedCells.map(cell => cell.rowId);
    return [...new Set(rowIds)];
  };

  const uniqueFields = getUniqueFields();
  const affectedRowIds = getAffectedRowIds();

  const handleSave = () => {
    const updatesArray: Array<{ rowId: string; field: keyof Campaign; value: any }> = [];

    // Для каждого поля, которое было изменено
    Object.entries(updates).forEach(([field, value]) => {
      if (value) {
        // Применяем изменения ко всем строкам, где было выбрано это поле
        selectedCells
          .filter(cell => cell.field === field)
          .forEach(cell => {
            updatesArray.push({
              rowId: cell.rowId,
              field: field as keyof Campaign,
              value: value
            });
          });
      }
    });

    onCellUpdate(updatesArray);
    onOpenChange(false);
    setUpdates({} as Record<keyof Campaign, string>);
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
      trafficAccount: 'Трафик-источник',
      offer: 'Оффер',
      country: 'Страна',
      rk: 'РК',
      pixel: 'Пиксель'
    };
    return labels[field] || field;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            Массовое редактирование
          </DialogTitle>
          <p className="text-sm text-gray-600">
            Редактирование {uniqueFields.length} типов полей для {affectedRowIds.length} кампаний
          </p>
        </DialogHeader>

        <div className="grid gap-4 py-4 max-h-96 overflow-y-auto">
          {uniqueFields.map((field) => (
            <div key={field} className="grid grid-cols-4 items-center gap-4">
              <Label className="col-span-1 font-medium">{getFieldLabel(field)}</Label>
              <Select 
                value={updates[field] || ''} 
                onValueChange={(value) => setUpdates(prev => ({ ...prev, [field]: value }))}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder={`Выберите ${getFieldLabel(field).toLowerCase()}`} />
                </SelectTrigger>
                <SelectContent>
                  {getFieldOptions(field).map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
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
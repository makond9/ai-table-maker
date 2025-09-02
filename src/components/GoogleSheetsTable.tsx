import { useState, useRef, useEffect } from 'react';
import { Campaign, TRAFFIC_ACCOUNTS, OFFERS, COUNTRIES, RK_OPTIONS, PIXEL_OPTIONS } from '@/types/campaign';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Edit, Copy } from 'lucide-react';
import { CellEditDialog } from './CellEditDialog';

interface GoogleSheetsTableProps {
  campaigns: Campaign[];
  onUpdateCampaign: (id: string, updates: Partial<Campaign>) => void;
  onDeleteCampaign: (id: string) => void;
  isLaunched?: boolean;
}

interface SelectedCell {
  rowId: string;
  field: keyof Campaign;
}

interface SelectedRange {
  startRow: number;
  endRow: number;
  startCol: number;
  endCol: number;
}

export function GoogleSheetsTable({ campaigns, onUpdateCampaign, onDeleteCampaign, isLaunched = false }: GoogleSheetsTableProps) {
  const [selectedCells, setSelectedCells] = useState<SelectedCell[]>([]);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [editingCell, setEditingCell] = useState<SelectedCell | null>(null);
  const [editValue, setEditValue] = useState('');
  const [cellEditOpen, setCellEditOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ row: number; col: number } | null>(null);

  const editableFields: (keyof Campaign)[] = ['trafficAccount', 'offer', 'country', 'rk', 'pixel'];
  
  const tableRef = useRef<HTMLDivElement>(null);

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

  const isCellSelected = (rowId: string, field: keyof Campaign) => {
    return selectedCells.some(cell => cell.rowId === rowId && cell.field === field);
  };

  const isRowSelected = (rowId: string) => {
    return selectedRows.includes(rowId);
  };

  const handleCellClick = (rowId: string, field: keyof Campaign, rowIndex: number, colIndex: number, event: React.MouseEvent) => {
    event.preventDefault();
    
    if (event.ctrlKey || event.metaKey) {
      // Ctrl+клик: добавить/убрать ячейку из выбора
      setSelectedCells(prev => {
        const exists = prev.some(cell => cell.rowId === rowId && cell.field === field);
        if (exists) {
          return prev.filter(cell => !(cell.rowId === rowId && cell.field === field));
        } else {
          return [...prev, { rowId, field }];
        }
      });
    } else if (event.shiftKey && selectedCells.length > 0) {
      // Shift+клик: выбрать диапазон ячеек
      const lastCell = selectedCells[selectedCells.length - 1];
      const lastRowIndex = campaigns.findIndex(c => c.id === lastCell.rowId);
      const lastColIndex = editableFields.indexOf(lastCell.field);
      
      const startRow = Math.min(lastRowIndex, rowIndex);
      const endRow = Math.max(lastRowIndex, rowIndex);
      const startCol = Math.min(lastColIndex, colIndex);
      const endCol = Math.max(lastColIndex, colIndex);
      
      const newSelection: SelectedCell[] = [];
      for (let r = startRow; r <= endRow; r++) {
        for (let c = startCol; c <= endCol; c++) {
          newSelection.push({
            rowId: campaigns[r].id,
            field: editableFields[c]
          });
        }
      }
      setSelectedCells(newSelection);
    } else {
      // Обычный клик: выбрать только эту ячейку
      setSelectedCells([{ rowId, field }]);
    }
    
    setSelectedRows([]);
  };

  const handleRowHeaderClick = (rowId: string, rowIndex: number, event: React.MouseEvent) => {
    event.preventDefault();
    
    if (event.ctrlKey || event.metaKey) {
      // Ctrl+клик: добавить/убрать строку
      setSelectedRows(prev => {
        const exists = prev.includes(rowId);
        if (exists) {
          return prev.filter(id => id !== rowId);
        } else {
          return [...prev, rowId];
        }
      });
    } else if (event.shiftKey && selectedRows.length > 0) {
      // Shift+клик: выбрать диапазон строк
      const lastRowId = selectedRows[selectedRows.length - 1];
      const lastRowIndex = campaigns.findIndex(c => c.id === lastRowId);
      
      const startRow = Math.min(lastRowIndex, rowIndex);
      const endRow = Math.max(lastRowIndex, rowIndex);
      
      const newSelection = campaigns.slice(startRow, endRow + 1).map(c => c.id);
      setSelectedRows(newSelection);
    } else {
      // Обычный клик: выбрать только эту строку
      setSelectedRows([rowId]);
    }
    
    setSelectedCells([]);
  };

  const handleCellDoubleClick = (rowId: string, field: keyof Campaign) => {
    if (!editableFields.includes(field)) return;
    
    const campaign = campaigns.find(c => c.id === rowId);
    if (campaign) {
      setEditingCell({ rowId, field });
      setEditValue(String(campaign[field]));
    }
  };

  const handleEditSave = () => {
    if (editingCell && editValue) {
      onUpdateCampaign(editingCell.rowId, { [editingCell.field]: editValue });
    }
    setEditingCell(null);
    setEditValue('');
  };

  const handleBulkCellEdit = () => {
    setCellEditOpen(true);
  };

  const handleCellUpdate = (updates: Array<{ rowId: string; field: keyof Campaign; value: any }>) => {
    updates.forEach(update => {
      onUpdateCampaign(update.rowId, { [update.field]: update.value });
    });
    setSelectedCells([]);
  };

  const columns = isLaunched 
    ? [
        { key: 'campaignName' as keyof Campaign, label: 'Название кампании', editable: false },
        { key: 'campaignUrl' as keyof Campaign, label: 'Ссылка на кампанию', editable: false }
      ]
    : [
        { key: 'trafficAccount' as keyof Campaign, label: 'Трафик аккаунт', editable: true },
        { key: 'offer' as keyof Campaign, label: 'Оффер', editable: true },
        { key: 'country' as keyof Campaign, label: 'Страна', editable: true },
        { key: 'rk' as keyof Campaign, label: 'РК', editable: true },
        { key: 'pixel' as keyof Campaign, label: 'Пиксель', editable: true },
        { key: 'createdAt' as keyof Campaign, label: 'Создано', editable: false }
      ];

  return (
    <div className="rounded-lg border border-gray-300 bg-white overflow-hidden shadow-sm">
      {/* Панель инструментов */}
      {(selectedCells.length > 0 || selectedRows.length > 0) && !isLaunched && (
        <div className="bg-blue-50 border-b border-gray-300 p-3 flex items-center justify-between">
          <div className="text-sm font-medium text-gray-700">
            {selectedCells.length > 0 && `Выбрано ячеек: ${selectedCells.length}`}
            {selectedRows.length > 0 && `Выбрано строк: ${selectedRows.length}`}
          </div>
          <div className="flex gap-2">
            {selectedCells.length > 0 && (
              <Button size="sm" variant="outline" onClick={handleBulkCellEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Редактировать ячейки
              </Button>
            )}
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => {
                setSelectedCells([]);
                setSelectedRows([]);
              }}
            >
              Отменить выбор
            </Button>
          </div>
        </div>
      )}

      {/* Таблица в стиле Google Sheets */}
      <div className="overflow-auto" ref={tableRef}>
        <table className="w-full border-collapse">
          {/* Заголовок */}
          <thead>
            <tr>
              <th className="w-12 h-8 bg-gray-100 border border-gray-300 text-xs font-medium text-gray-600"></th>
              {columns.map((col, index) => (
                <th key={col.key} className="min-w-32 h-8 bg-gray-100 border border-gray-300 text-xs font-medium text-gray-600 px-2">
                  {col.label}
                </th>
              ))}
              {!isLaunched && (
                <th className="w-24 h-8 bg-gray-100 border border-gray-300 text-xs font-medium text-gray-600">
                  Действия
                </th>
              )}
            </tr>
          </thead>

          {/* Тело таблицы */}
          <tbody>
            {campaigns.map((campaign, rowIndex) => (
              <tr key={campaign.id}>
                {/* Заголовок строки */}
                <td 
                  className={`w-12 h-8 bg-gray-100 border border-gray-300 text-xs text-center cursor-pointer hover:bg-gray-200 ${
                    isRowSelected(campaign.id) ? 'bg-blue-200' : ''
                  }`}
                  onClick={(e) => handleRowHeaderClick(campaign.id, rowIndex, e)}
                >
                  {rowIndex + 1}
                </td>

                {/* Ячейки данных */}
                {columns.map((col, colIndex) => {
                  const isSelected = isCellSelected(campaign.id, col.key);
                  const isEditing = editingCell?.rowId === campaign.id && editingCell?.field === col.key;
                  
                  return (
                    <td 
                      key={col.key}
                      className={`h-8 border border-gray-300 px-2 text-sm cursor-cell ${
                        isSelected ? 'bg-blue-100 border-blue-400 border-2' : 'hover:bg-gray-50'
                      } ${isRowSelected(campaign.id) ? 'bg-blue-50' : ''}`}
                      onClick={(e) => col.editable && handleCellClick(campaign.id, col.key, rowIndex, colIndex, e)}
                      onDoubleClick={() => handleCellDoubleClick(campaign.id, col.key)}
                    >
                      {isEditing ? (
                        <Select
                          value={editValue}
                          onValueChange={setEditValue}
                          onOpenChange={(open) => {
                            if (!open) {
                              handleEditSave();
                            }
                          }}
                        >
                          <SelectTrigger className="h-6 border-none p-0 bg-transparent">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {getFieldOptions(col.key).map((option) => (
                              <SelectItem key={option} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : col.key === 'campaignUrl' && campaign.campaignUrl ? (
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigator.clipboard.writeText(campaign.campaignUrl!)}
                            className="h-6 p-1"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                          <span className="text-xs truncate">{campaign.campaignUrl}</span>
                        </div>
                      ) : col.key === 'createdAt' ? (
                        (campaign[col.key] as Date).toLocaleDateString('ru-RU')
                      ) : (
                        String(campaign[col.key] || '-')
                      )}
                    </td>
                  );
                })}

                {/* Действия */}
                {!isLaunched && (
                  <td className="h-8 border border-gray-300 px-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onDeleteCampaign(campaign.id)}
                      className="h-6 w-6 p-0"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {campaigns.length === 0 && (
        <div className="p-8 text-center text-gray-500">
          <p>Нет кампаний. Начните добавлять их через чат!</p>
        </div>
      )}

      <CellEditDialog
        open={cellEditOpen}
        onOpenChange={setCellEditOpen}
        selectedCells={selectedCells}
        campaigns={campaigns}
        onCellUpdate={handleCellUpdate}
      />
    </div>
  );
}
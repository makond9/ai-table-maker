import { useState, useRef } from 'react';
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

export function GoogleSheetsTable({ campaigns, onUpdateCampaign, onDeleteCampaign, isLaunched = false }: GoogleSheetsTableProps) {
  const [selectedCells, setSelectedCells] = useState<SelectedCell[]>([]);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [editingCell, setEditingCell] = useState<SelectedCell | null>(null);
  const [editValue, setEditValue] = useState('');
  const [cellEditOpen, setCellEditOpen] = useState(false);

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
    event.stopPropagation();
    
    // Предотвращаем выделение текста
    if (window.getSelection) {
      window.getSelection()?.removeAllRanges();
    }
    
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
          if (campaigns[r] && editableFields[c]) {
            newSelection.push({
              rowId: campaigns[r].id,
              field: editableFields[c]
            });
          }
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
    
    // Предотвращаем выделение текста
    if (window.getSelection) {
      window.getSelection()?.removeAllRanges();
    }
    
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
    // Разрешаем редактирование только для определенных полей
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
    <div className="rounded-xl border-2 border-gray-200 bg-white overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
      {/* Панель инструментов */}
      {(selectedCells.length > 0 || selectedRows.length > 0) && !isLaunched && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b-2 border-blue-200 p-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-blue-800 flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              {selectedCells.length > 0 && `Выбрано ячеек: ${selectedCells.length}`}
              {selectedRows.length > 0 && `Выбрано строк: ${selectedRows.length}`}
            </div>
            <div className="flex gap-3">
              {selectedCells.length > 0 && (
                <Button 
                  size="sm" 
                  className="bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                  onClick={handleBulkCellEdit}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Редактировать ячейки
                </Button>
              )}
              <Button 
                size="sm" 
                variant="outline"
                className="border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-400 transition-all duration-200"
                onClick={() => {
                  setSelectedCells([]);
                  setSelectedRows([]);
                }}
              >
                Отменить выбор
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Таблица в стиле Google Sheets */}
      <div className="overflow-auto" ref={tableRef}>
        <table className="w-full border-collapse bg-white">
          {/* Заголовок */}
          <thead>
            <tr>
              <th className="sticky top-0 left-0 z-20 w-12 h-10 bg-gradient-to-b from-gray-50 to-gray-100 border-r-2 border-b-2 border-gray-300 text-xs font-semibold text-gray-600 shadow-sm">
                <div className="w-full h-full flex items-center justify-center hover:bg-gray-200 transition-colors duration-150 cursor-pointer select-none">
                  <div className="w-4 h-4 border border-gray-400 rounded-sm"></div>
                </div>
              </th>
              {columns.map((col, index) => (
                <th 
                  key={col.key} 
                  className="sticky top-0 z-10 min-w-36 h-10 bg-gradient-to-b from-gray-50 to-gray-100 border-r border-b-2 border-gray-300 text-xs font-semibold text-gray-700 px-3 hover:bg-gray-200 transition-colors duration-150 cursor-pointer"
                >
                  <div className="flex items-center justify-center h-full select-none">
                    {col.label}
                  </div>
                </th>
              ))}
              {!isLaunched && (
                <th className="sticky top-0 z-10 w-24 h-10 bg-gradient-to-b from-gray-50 to-gray-100 border-b-2 border-gray-300 text-xs font-semibold text-gray-700 select-none">
                  <div className="flex items-center justify-center h-full">
                    Действия
                  </div>
                </th>
              )}
            </tr>
          </thead>

          {/* Тело таблицы */}
          <tbody>
            {campaigns.map((campaign, rowIndex) => {
              const isRowSelectedState = isRowSelected(campaign.id);
              return (
                <tr 
                  key={campaign.id}
                  className={`group hover:bg-blue-50/50 transition-all duration-200 ${
                    isRowSelectedState ? 'bg-blue-50 ring-2 ring-blue-300' : ''
                  }`}
                >
                  {/* Заголовок строки */}
                  <td 
                    className={`sticky left-0 z-10 w-12 h-10 bg-gradient-to-r from-gray-50 to-gray-100 border-r-2 border-b border-gray-300 text-xs text-center cursor-pointer font-medium text-gray-700 hover:bg-gray-200 transition-all duration-150 select-none ${
                      isRowSelectedState ? 'bg-blue-100 border-r-blue-400' : ''
                    }`}
                    onClick={(e) => handleRowHeaderClick(campaign.id, rowIndex, e)}
                  >
                    <div className="w-full h-full flex items-center justify-center">
                      {rowIndex + 1}
                    </div>
                  </td>

                  {/* Ячейки данных */}
                  {columns.map((col, colIndex) => {
                    const isSelected = isCellSelected(campaign.id, col.key);
                    const isEditing = editingCell?.rowId === campaign.id && editingCell?.field === col.key;
                    
                    return (
                      <td 
                        key={col.key}
                        className={`relative h-10 border-r border-b border-gray-200 px-3 text-sm cursor-cell select-none transition-all duration-150 group-hover:bg-blue-25 ${
                          isSelected 
                            ? 'bg-blue-200 ring-2 ring-blue-500 ring-inset shadow-sm' 
                            : 'hover:bg-blue-100/60'
                        } ${isRowSelectedState ? 'bg-blue-50' : ''}`}
                        onClick={(e) => handleCellClick(campaign.id, col.key, rowIndex, colIndex, e)}
                        onDoubleClick={() => handleCellDoubleClick(campaign.id, col.key)}
                      >
                        {isEditing ? (
                          <div className="absolute inset-0 z-20">
                            <Select
                              value={editValue}
                              onValueChange={setEditValue}
                              onOpenChange={(open) => {
                                if (!open) {
                                  handleEditSave();
                                }
                              }}
                            >
                              <SelectTrigger className="h-full border-none rounded-none bg-white shadow-lg">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="z-50">
                                {getFieldOptions(col.key).map((option) => (
                                  <SelectItem key={option} value={option}>
                                    {option}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        ) : col.key === 'campaignUrl' && campaign.campaignUrl ? (
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => navigator.clipboard.writeText(campaign.campaignUrl!)}
                              className="h-6 p-1 hover:bg-blue-200 transition-colors duration-150"
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                            <span className="text-xs truncate text-blue-600 font-mono">
                              {campaign.campaignUrl}
                            </span>
                          </div>
                        ) : col.key === 'createdAt' ? (
                          <span className="text-gray-600 font-mono text-xs">
                            {(campaign[col.key] as Date).toLocaleDateString('ru-RU')}
                          </span>
                        ) : (
                          <span className={`block truncate ${
                            col.key === 'trafficAccount' ? 'font-semibold text-blue-700' :
                            col.key === 'offer' ? 'font-medium text-green-700' :
                            col.key === 'country' ? 'text-purple-700' :
                            col.key === 'rk' ? 'text-orange-700 font-mono' :
                            col.key === 'pixel' ? 'text-pink-700' :
                            'text-gray-700'
                          }`}>
                            {String(campaign[col.key] || '-')}
                          </span>
                        )}
                      </td>
                    );
                  })}

                  {/* Действия */}
                  {!isLaunched && (
                    <td className="h-10 border-b border-gray-200 px-3">
                      <div className="flex items-center justify-center h-full">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onDeleteCampaign(campaign.id)}
                          className="h-7 w-7 p-0 hover:bg-red-100 hover:text-red-600 transition-all duration-200 opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {campaigns.length === 0 && (
        <div className="p-12 text-center">
          <div className="animate-fade-in">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
              <Edit className="w-8 h-8 text-blue-500" />
            </div>
            <p className="text-gray-500 text-lg font-medium">Нет кампаний</p>
            <p className="text-gray-400 text-sm mt-1">Начните добавлять их через чат!</p>
          </div>
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
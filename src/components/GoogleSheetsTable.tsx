import { useState, useRef, useCallback } from 'react';
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
  const [columnWidths, setColumnWidths] = useState<{ [key: string]: number }>({});
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ row: number; col: number } | null>(null);
  const [isResizing, setIsResizing] = useState<string | null>(null);

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

  // Обработка drag selection
  const handleMouseDown = (rowId: string, field: keyof Campaign, rowIndex: number, colIndex: number, event: React.MouseEvent) => {
    if (isResizing) return;
    
    event.preventDefault();
    if (window.getSelection) {
      window.getSelection()?.removeAllRanges();
    }

    setIsDragging(true);
    setDragStart({ row: rowIndex, col: colIndex });
    setSelectedCells([{ rowId, field }]);
  };

  const handleMouseEnter = (rowId: string, field: keyof Campaign, rowIndex: number, colIndex: number) => {
    if (!isDragging || !dragStart) return;

    const startRow = Math.min(dragStart.row, rowIndex);
    const endRow = Math.max(dragStart.row, rowIndex);
    const startCol = Math.min(dragStart.col, colIndex);
    const endCol = Math.max(dragStart.col, colIndex);

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
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDragStart(null);
  };

  // Обработка изменения ширины колонок
  const handleColumnResize = (columnKey: string, event: React.MouseEvent) => {
    event.preventDefault();
    setIsResizing(columnKey);
    
    const startX = event.clientX;
    const startWidth = columnWidths[columnKey] || 150;

    const handleMouseMove = (e: MouseEvent) => {
      const newWidth = Math.max(80, startWidth + (e.clientX - startX));
      setColumnWidths(prev => ({ ...prev, [columnKey]: newWidth }));
    };

    const handleMouseUpResize = () => {
      setIsResizing(null);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUpResize);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUpResize);
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
    <div className="rounded-xl border border-table-border bg-card overflow-hidden shadow-lg">{/*Professional container*/}
      {/* Панель инструментов */}
      {(selectedCells.length > 0 || selectedRows.length > 0) && !isLaunched && (
        <div className="bg-table-header border-b border-table-header-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium text-foreground flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              {selectedCells.length > 0 && `Выбрано ячеек: ${selectedCells.length}`}
              {selectedRows.length > 0 && `Выбрано строк: ${selectedRows.length}`}
            </div>
            <div className="flex gap-2">
              {selectedCells.length > 0 && (
                <Button 
                  size="sm" 
                  className="h-8"
                  onClick={handleBulkCellEdit}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Редактировать ячейки
                </Button>
              )}
              <Button 
                size="sm" 
                variant="outline"
                className="h-8"
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
      <div className="overflow-auto" ref={tableRef} onMouseUp={handleMouseUp}>
        <table className="w-full border-collapse bg-card">
          {/* Заголовок */}
          <thead>
            <tr>
              <th className="sticky top-0 left-0 z-20 w-14 h-12 bg-table-header border-r-2 border-b-2 border-table-header-border text-xs font-semibold text-muted-foreground">
                <div className="w-full h-full flex items-center justify-center hover:bg-table-row-hover transition-colors cursor-pointer select-none">
                  <div className="w-4 h-4 border-2 border-border rounded"></div>
                </div>
              </th>
              {columns.map((col, index) => (
                <th 
                  key={col.key} 
                  className="sticky top-0 z-10 h-12 bg-table-header border-r-2 border-b-2 border-table-header-border text-sm font-semibold text-foreground px-4 hover:bg-table-row-hover transition-colors relative group"
                  style={{ 
                    width: columnWidths[col.key] || 150,
                    minWidth: columnWidths[col.key] || 150 
                  }}
                >
                  <div className="flex items-center justify-start h-full select-none cursor-pointer truncate font-medium">
                    {col.label}
                  </div>
                  {/* Ресайзер колонки */}
                  <div 
                    className="absolute right-0 top-0 w-1 h-full cursor-col-resize bg-transparent hover:bg-table-resize-handle transition-colors opacity-0 group-hover:opacity-100"
                    onMouseDown={(e) => handleColumnResize(col.key, e)}
                  />
                </th>
              ))}
              {!isLaunched && (
                <th className="sticky top-0 z-10 w-28 h-12 bg-table-header border-b-2 border-table-header-border text-sm font-semibold text-foreground select-none">
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
                  className={`group hover:bg-table-row-hover transition-colors ${
                    isRowSelectedState ? 'bg-table-row-selected' : ''
                  }`}
                >
                  {/* Заголовок строки */}
                  <td 
                    className={`sticky left-0 z-10 w-14 h-12 bg-table-header border-r-2 border-b border-table-border text-sm text-center cursor-pointer font-semibold text-muted-foreground hover:bg-table-row-hover transition-colors select-none ${
                      isRowSelectedState ? 'bg-table-row-selected' : ''
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
                        className={`relative h-12 border-r border-b border-table-border px-4 text-sm cursor-cell select-none transition-all duration-150 font-medium ${
                          isSelected 
                            ? 'bg-table-cell-selected ring-2 ring-inset ring-primary shadow-inner' 
                            : 'hover:bg-table-row-hover'
                        } ${isRowSelectedState ? 'bg-table-row-selected' : ''}`}
                        style={{ 
                          width: columnWidths[col.key] || 150,
                          minWidth: columnWidths[col.key] || 150 
                        }}
                        onMouseDown={(e) => handleMouseDown(campaign.id, col.key, rowIndex, colIndex, e)}
                        onMouseEnter={() => handleMouseEnter(campaign.id, col.key, rowIndex, colIndex)}
                        onClick={(e) => !isDragging && handleCellClick(campaign.id, col.key, rowIndex, colIndex, e)}
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
                            <span className="text-xs truncate text-foreground font-mono">
                              {campaign.campaignUrl}
                            </span>
                          </div>
                        ) : col.key === 'createdAt' ? (
                          <span className="text-muted-foreground font-mono text-xs">
                            {(campaign[col.key] as Date).toLocaleDateString('ru-RU')}
                          </span>
                        ) : (
                          <span className="block truncate text-foreground">
                            {String(campaign[col.key] || '-')}
                          </span>
                        )}
                      </td>
                    );
                  })}

                  {/* Действия */}
                  {!isLaunched && (
                    <td className="h-11 border-b border-table-border px-3">
                      <div className="flex items-center justify-center h-full">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onDeleteCampaign(campaign.id)}
                          className="h-7 w-7 p-0 hover:bg-destructive/10 hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
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
        <div className="text-center py-16 px-4">
          <div className="max-w-md mx-auto">
            <div className="mb-6">
              <div className="w-16 h-16 mx-auto bg-muted rounded-lg flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-border border-dashed rounded"></div>
              </div>
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">
              Пока нет кампаний
            </h3>
            <p className="text-muted-foreground text-sm">
              Используйте чат ниже, чтобы создать ваши первые кампании.
            </p>
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
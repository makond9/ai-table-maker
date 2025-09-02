import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Plus, Trash2, Edit2 } from 'lucide-react';
import { TRAFFIC_ACCOUNTS, OFFERS, COUNTRIES } from '@/types/campaign';

export interface CommandPattern {
  id: string;
  field: string;
  keywords: string[];
  values: string[];
}

interface CommandManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommandManager: React.FC<CommandManagerProps> = ({ isOpen, onClose }) => {
  const [patterns, setPatterns] = useState<CommandPattern[]>([
    {
      id: '1',
      field: 'trafficAccount',
      keywords: ['мета', 'facebook', 'fb'],
      values: ['Мета']
    },
    {
      id: '2',
      field: 'trafficAccount',
      keywords: ['тикток', 'tiktok'],
      values: ['ТикТок']
    },
    {
      id: '3',
      field: 'offer',
      keywords: ['финанс', 'банк', 'кредит'],
      values: ['Финансы']
    },
    {
      id: '4',
      field: 'offer',
      keywords: ['здоров', 'медиц', 'лечен'],
      values: ['Здоровье']
    },
    {
      id: '5',
      field: 'offer',
      keywords: ['крипт', 'bitcoin', 'btc'],
      values: ['Крипто']
    },
    {
      id: '6',
      field: 'offer',
      keywords: ['казино', 'ставк', 'игр'],
      values: ['Гемблинг']
    },
    {
      id: '7',
      field: 'country',
      keywords: ['рф', 'россия'],
      values: ['Россия']
    },
    {
      id: '8',
      field: 'country',
      keywords: ['сша', 'америк'],
      values: ['США']
    },
    {
      id: '9',
      field: 'country',
      keywords: ['англ', 'британ'],
      values: ['Великобритания']
    }
  ]);

  const [editingPattern, setEditingPattern] = useState<CommandPattern | null>(null);
  const [newKeyword, setNewKeyword] = useState('');

  const handleAddKeyword = (patternId: string) => {
    if (!newKeyword.trim()) return;
    
    setPatterns(prev => prev.map(pattern => 
      pattern.id === patternId 
        ? { ...pattern, keywords: [...pattern.keywords, newKeyword.trim().toLowerCase()] }
        : pattern
    ));
    setNewKeyword('');
  };

  const handleRemoveKeyword = (patternId: string, keyword: string) => {
    setPatterns(prev => prev.map(pattern => 
      pattern.id === patternId 
        ? { ...pattern, keywords: pattern.keywords.filter(k => k !== keyword) }
        : pattern
    ));
  };

  const handleAddPattern = () => {
    const newPattern: CommandPattern = {
      id: Date.now().toString(),
      field: 'offer',
      keywords: [],
      values: []
    };
    setPatterns(prev => [...prev, newPattern]);
    setEditingPattern(newPattern);
  };

  const handleDeletePattern = (patternId: string) => {
    setPatterns(prev => prev.filter(p => p.id !== patternId));
  };

  const getFieldLabel = (field: string) => {
    switch (field) {
      case 'trafficAccount': return 'Трафик-аккаунт';
      case 'offer': return 'Оффер';
      case 'country': return 'Страна';
      default: return field;
    }
  };

  const getAvailableValues = (field: string) => {
    switch (field) {
      case 'trafficAccount': return TRAFFIC_ACCOUNTS;
      case 'offer': return OFFERS;
      case 'country': return COUNTRIES;
      default: return [];
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background border rounded-lg w-[90vw] max-w-4xl h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold">Управление командами AI</h2>
          <Button variant="outline" onClick={onClose}>Закрыть</Button>
        </div>
        
        <div className="flex-1 overflow-hidden">
          <Tabs defaultValue="patterns" className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-2 mx-4 mt-4">
              <TabsTrigger value="patterns">Паттерны команд</TabsTrigger>
              <TabsTrigger value="preview">Предпросмотр</TabsTrigger>
            </TabsList>
            
            <TabsContent value="patterns" className="flex-1 overflow-auto p-4 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Паттерны распознавания</h3>
                <Button onClick={handleAddPattern} size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Добавить паттерн
                </Button>
              </div>
              
              <div className="space-y-4">
                {patterns.map(pattern => (
                  <Card key={pattern.id}>
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-base">
                          {getFieldLabel(pattern.field)}
                        </CardTitle>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setEditingPattern(pattern)}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDeletePattern(pattern.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-3">
                      <div>
                        <Label className="text-sm font-medium">Ключевые слова:</Label>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {pattern.keywords.map(keyword => (
                            <Badge 
                              key={keyword} 
                              variant="secondary"
                              className="cursor-pointer"
                              onClick={() => handleRemoveKeyword(pattern.id, keyword)}
                            >
                              {keyword} ×
                            </Badge>
                          ))}
                        </div>
                        
                        <div className="flex gap-2 mt-2">
                          <Input
                            placeholder="Добавить ключевое слово"
                            value={newKeyword}
                            onChange={(e) => setNewKeyword(e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                handleAddKeyword(pattern.id);
                              }
                            }}
                          />
                          <Button 
                            onClick={() => handleAddKeyword(pattern.id)}
                            size="sm"
                          >
                            Добавить
                          </Button>
                        </div>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium">Значения:</Label>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {pattern.values.map(value => (
                            <Badge key={value} variant="default">
                              {value}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="preview" className="flex-1 overflow-auto p-4">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Тестирование команд</h3>
                <div className="grid gap-4">
                  <div>
                    <Label>Введите команду для тестирования:</Label>
                    <Input placeholder="Например: создай кампанию для финансов в России через Мету" />
                  </div>
                  <div>
                    <Label>Результат распознавания:</Label>
                    <div className="border rounded p-3 bg-muted/50 text-sm">
                      Здесь будет отображаться результат парсинга команды
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};
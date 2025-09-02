import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Send, Bot, User, Settings, Play, Cog } from 'lucide-react';
import { CommandManager } from './CommandManager';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface ChatInterfaceProps {
  onSendMessage: (message: string) => void;
  onLaunchCampaigns: () => void;
  hasCampaigns: boolean;
}

export function ChatInterface({ onSendMessage, onLaunchCampaigns, hasCampaigns }: ChatInterfaceProps) {
  const [mainMessages, setMainMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Привет! Я помогу вам создать кампании. Примеры команд:\n• "Создай кампанию для Меты с оффером Финансы для России"\n• "Измени РК на РК-005"\n• "Измени пиксель на Google Analytics"',
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [adminMessages, setAdminMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Добро пожаловать в админ чат! Здесь вы можете управлять системными настройками и получить расширенные возможности.',
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [activeTab, setActiveTab] = useState('main');
  const [isCommandManagerOpen, setIsCommandManagerOpen] = useState(false);

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      isUser: true,
      timestamp: new Date()
    };

    if (activeTab === 'main') {
      setMainMessages(prev => [...prev, userMessage]);
      onSendMessage(inputValue);

      // Simulate AI response
      setTimeout(() => {
        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          text: 'Понял! Создаю кампанию...',
          isUser: false,
          timestamp: new Date()
        };
        setMainMessages(prev => [...prev, aiResponse]);
      }, 500);
    } else {
      setAdminMessages(prev => [...prev, userMessage]);
      
      // Simulate admin AI response
      setTimeout(() => {
        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          text: 'Админ функция обрабатывается...',
          isUser: false,
          timestamp: new Date()
        };
        setAdminMessages(prev => [...prev, aiResponse]);
      }, 500);
    }

    setInputValue('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  const renderMessages = (messages: Message[]) => (
    <ScrollArea className="flex-1 p-4">
      <div className="space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${message.isUser ? 'justify-end' : 'justify-start'}`}
          >
            {!message.isUser && (
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                <Bot className="h-4 w-4 text-primary-foreground" />
              </div>
            )}
            
            <div
              className={`max-w-[80%] p-3 rounded-lg ${
                message.isUser
                  ? 'bg-chat-user-bg text-chat-user-text'
                  : 'bg-chat-ai-bg text-chat-ai-text'
              }`}
            >
              <p className="text-sm">{message.text}</p>
              <span className="text-xs opacity-70 mt-1 block">
                {message.timestamp.toLocaleTimeString('ru-RU')}
              </span>
            </div>

            {message.isUser && (
              <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                <User className="h-4 w-4 text-secondary-foreground" />
              </div>
            )}
          </div>
        ))}
      </div>
    </ScrollArea>
  );

  return (
    <div className="flex flex-col h-full bg-chat-background rounded-lg border border-border">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            AI Ассистент кампаний
          </h3>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setIsCommandManagerOpen(true)}
          >
            <Cog className="w-4 h-4 mr-2" />
            Команды
          </Button>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="main" className="flex items-center gap-2">
              <Bot className="h-4 w-4" />
              Основной чат
            </TabsTrigger>
            <TabsTrigger value="admin" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Админ чат
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsContent value="main" className="flex-1 flex flex-col m-0">
          {renderMessages(mainMessages)}
        </TabsContent>
        
        <TabsContent value="admin" className="flex-1 flex flex-col m-0">
          {renderMessages(adminMessages)}
        </TabsContent>

        <div className="p-4 border-t border-border">
          {hasCampaigns && (
            <div className="mb-3">
              <Button 
                onClick={onLaunchCampaigns} 
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                <Play className="h-4 w-4 mr-2" />
                Запуск кампаний
              </Button>
            </div>
          )}
          <div className="flex gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={activeTab === 'main' ? "Опишите кампанию которую хотите создать..." : "Введите админ команду..."}
              className="flex-1"
            />
            <Button onClick={handleSend} size="icon">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Tabs>
      
      <CommandManager 
        isOpen={isCommandManagerOpen}
        onClose={() => setIsCommandManagerOpen(false)}
      />
    </div>
  );
}
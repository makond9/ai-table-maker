import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Send, Bot, User, Settings, Play, Cog, Sparkles, Zap, Loader2 } from 'lucide-react';
import { CommandManager } from './CommandManager';
import { ApiKeyDialog } from './ApiKeyDialog';
import { aiService } from '@/services/aiService';
import { AIThinkingAnimation } from './AIThinkingAnimation';

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
  onAIParseMessage?: (message: string) => Promise<void>;
  needsConfirmation?: boolean;
  onConfirmLaunch?: () => void;
  showThinking?: boolean;
  onThinkingComplete?: () => void;
}

export function ChatInterface({ onSendMessage, onLaunchCampaigns, hasCampaigns, onAIParseMessage, needsConfirmation, onConfirmLaunch, showThinking, onThinkingComplete }: ChatInterfaceProps) {
  const [mainMessages, setMainMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Привет! Я помогу создать кампании. Примеры команд:\n• "Создай кампанию для Меты с оффером Финансы для России"\n• "Измени РК на РК-005"\n\n💡 Подключите OpenAI API для улучшенного понимания команд!',
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
  const [isApiKeyDialogOpen, setIsApiKeyDialogOpen] = useState(false);
  const [isAiEnabled, setIsAiEnabled] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    setIsAiEnabled(aiService.hasApiKey());
  }, []);

  const handleSend = async () => {
    if (!inputValue.trim() || isProcessing) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      isUser: true,
      timestamp: new Date()
    };

    if (activeTab === 'main') {
      setMainMessages(prev => [...prev, userMessage]);
      
      if (isAiEnabled && onAIParseMessage) {
        setIsProcessing(true);
        try {
          await onAIParseMessage(inputValue);
          
          // AI response будет добавлен через onAIParseMessage
          setTimeout(() => {
            const aiResponse: Message = {
              id: (Date.now() + 1).toString(),
              text: '✨ Команда обработана с помощью AI',
              isUser: false,
              timestamp: new Date()
            };
            setMainMessages(prev => [...prev, aiResponse]);
          }, 500);
        } catch (error) {
          const errorResponse: Message = {
            id: (Date.now() + 1).toString(),
            text: `Ошибка AI: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`,
            isUser: false,
            timestamp: new Date()
          };
          setMainMessages(prev => [...prev, errorResponse]);
        } finally {
          setIsProcessing(false);
        }
      } else {
        // Используем обычную обработку
        onSendMessage(inputValue);
        
        setTimeout(() => {
          const aiResponse: Message = {
            id: (Date.now() + 1).toString(),
            text: 'Понял! Создаю кампанию...',
            isUser: false,
            timestamp: new Date()
          };
          setMainMessages(prev => [...prev, aiResponse]);
        }, 500);
      }
    } else {
      setAdminMessages(prev => [...prev, userMessage]);
      
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

  const handleApiKeySet = (apiKey: string) => {
    aiService.setApiKey(apiKey);
    setIsAiEnabled(true);
    
    // Добавляем сообщение об успешном подключении
    const successMessage: Message = {
      id: Date.now().toString(),
      text: '🚀 AI подключен! Теперь я буду понимать ваши команды намного лучше.',
      isUser: false,
      timestamp: new Date()
    };
    setMainMessages(prev => [...prev, successMessage]);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (needsConfirmation && onConfirmLaunch) {
        onConfirmLaunch();
      } else {
        handleSend();
      }
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
            {isAiEnabled && <Zap className="h-4 w-4 text-green-500" />}
          </h3>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setIsCommandManagerOpen(true)}
            >
              <Cog className="w-4 h-4 mr-2" />
              Команды
            </Button>
          </div>
        </div>
        
      </div>

      <div className="flex-1 flex flex-col">
        {renderMessages(mainMessages)}
        
        {showThinking && onThinkingComplete && (
          <div className="px-4 pb-4">
            <AIThinkingAnimation onComplete={onThinkingComplete} />
          </div>
        )}

        <div className="p-4 border-t border-border">
          {(hasCampaigns || needsConfirmation) && (
            <div className="mb-3">
              <Button 
                onClick={needsConfirmation && onConfirmLaunch ? onConfirmLaunch : onLaunchCampaigns} 
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                <Play className="h-4 w-4 mr-2" />
                {needsConfirmation ? 'Подтвердить' : 'Запуск кампаний'}
              </Button>
            </div>
          )}
          <div className="flex gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Опишите кампанию которую хотите создать..."
              className="flex-1"
              disabled={isProcessing}
            />
            <Button onClick={handleSend} size="icon" disabled={isProcessing}>
              <Send className={`h-4 w-4 ${isProcessing ? 'animate-pulse' : ''}`} />
            </Button>
          </div>
        </div>
      </div>
      
      <CommandManager 
        isOpen={isCommandManagerOpen}
        onClose={() => setIsCommandManagerOpen(false)}
      />
      
      <ApiKeyDialog
        isOpen={isApiKeyDialogOpen}
        onClose={() => setIsApiKeyDialogOpen(false)}
        onApiKeySet={handleApiKeySet}
      />
    </div>
  );
}
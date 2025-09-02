import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { AlertCircle, Bot, Key } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ApiKeyDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onApiKeySet: (apiKey: string) => void;
}

export function ApiKeyDialog({ isOpen, onClose, onApiKeySet }: ApiKeyDialogProps) {
  const [apiKey, setApiKey] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (!apiKey.trim()) {
      setError('Введите API ключ');
      return;
    }

    if (!apiKey.startsWith('sk-')) {
      setError('API ключ OpenAI должен начинаться с "sk-"');
      return;
    }

    onApiKeySet(apiKey.trim());
    setApiKey('');
    setError('');
    onClose();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="h-5 w-5 text-primary" />
            Настройка AI
          </DialogTitle>
          <DialogDescription>
            Введите ваш OpenAI API ключ для использования GPT-5 для более точного распознавания команд
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Alert>
            <Bot className="h-4 w-4" />
            <AlertDescription>
              С API ключом ИИ будет значительно лучше понимать ваши команды и создавать точные кампании
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="apiKey">OpenAI API Key</Label>
            <Input
              id="apiKey"
              type="password"
              value={apiKey}
              onChange={(e) => {
                setApiKey(e.target.value);
                setError('');
              }}
              onKeyPress={handleKeyPress}
              placeholder="sk-..."
              className="font-mono"
            />
            {error && (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}
          </div>

          <div className="text-sm text-muted-foreground">
            <p>• Получите API ключ на <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">platform.openai.com</a></p>
            <p>• Ключ сохраняется только в текущей сессии</p>
            <p>• Без ключа работает базовый парсинг команд</p>
          </div>

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={onClose}>
              Позже
            </Button>
            <Button onClick={handleSubmit} disabled={!apiKey.trim()}>
              Сохранить
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
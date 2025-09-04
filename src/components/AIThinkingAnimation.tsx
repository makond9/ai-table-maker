import { useState, useEffect } from 'react';
import { Bot } from 'lucide-react';

interface AIThinkingAnimationProps {
  onComplete: () => void;
}

export function AIThinkingAnimation({ onComplete }: AIThinkingAnimationProps) {
  const [dotCount, setDotCount] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setDotCount(prev => (prev + 1) % 4); // 0, 1, 2, 3, потом снова 0
    }, 500);

    // Завершаем анимацию через 3 секунды
    const timeout = setTimeout(() => {
      clearInterval(interval);
      onComplete();
    }, 3000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [onComplete]);

  const dots = '.'.repeat(dotCount);

  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-chat-ai-bg rounded-lg border border-border">
      <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
        <Bot className="h-3 w-3 text-primary-foreground" />
      </div>
      <div className="flex items-center gap-1">
        <span className="text-sm text-chat-ai-text">thinking</span>
        <span className="text-sm text-chat-ai-text w-4 text-left">{dots}</span>
      </div>
    </div>
  );
}
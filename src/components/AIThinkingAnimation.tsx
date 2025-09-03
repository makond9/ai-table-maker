import { useState, useEffect } from 'react';
import { Bot } from 'lucide-react';

interface AIThinkingAnimationProps {
  onComplete: () => void;
}

export function AIThinkingAnimation({ onComplete }: AIThinkingAnimationProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const steps = [
    "Отправляю запрос на создание кампаний в Тоник"
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentStep < steps.length - 1) {
        setCurrentStep(prev => prev + 1);
      } else {
        // Завершаем анимацию через 2 секунды после последнего шага
        setTimeout(() => {
          setIsVisible(false);
          onComplete();
        }, 2000);
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [currentStep, steps.length, onComplete]);

  if (!isVisible) return null;

  return (
    <div className="flex gap-3 justify-start mb-4">
      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
        <Bot className="h-4 w-4 text-primary-foreground animate-pulse" />
      </div>
      
      <div className="max-w-[80%] p-3 rounded-lg bg-chat-ai-bg text-chat-ai-text">
        <div className="space-y-2">
          {steps.map((step, index) => (
            <div
              key={index}
              className={`transition-all duration-500 ${
                index <= currentStep 
                  ? 'opacity-100 translate-x-0' 
                  : 'opacity-0 translate-x-4'
              }`}
            >
              <div className="flex items-center gap-2">
                <div 
                  className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                    index <= currentStep ? 'bg-green-500' : 'bg-muted'
                  }`} 
                />
                <span 
                  className={`text-sm transition-colors duration-300 ${
                    index === currentStep ? 'text-chat-ai-text' : 'text-muted-foreground'
                  }`}
                >
                  {step}
                </span>
              </div>
              {index === currentStep && (
                <div className="ml-4 mt-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-1 bg-primary rounded-full animate-pulse"></div>
                    <div className="w-6 h-1 bg-primary/70 rounded-full animate-pulse [animation-delay:0.2s]"></div>
                    <div className="w-4 h-1 bg-primary/50 rounded-full animate-pulse [animation-delay:0.4s]"></div>
                    <div className="w-8 h-1 bg-primary/30 rounded-full animate-pulse [animation-delay:0.6s]"></div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        
        <span className="text-xs opacity-70 mt-2 block">
          {new Date().toLocaleTimeString('ru-RU')}
        </span>
      </div>
    </div>
  );
}
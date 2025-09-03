import { useState, useEffect } from 'react';
import { Bot } from 'lucide-react';

interface AIThinkingAnimationProps {
  onComplete: () => void;
}

export function AIThinkingAnimation({ onComplete }: AIThinkingAnimationProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const steps = [
    "* Отправляю запрос на создание кампаний в Тоник"
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
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-card p-8 rounded-lg border shadow-lg max-w-md w-full mx-4">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <Bot className="h-4 w-4 text-primary-foreground animate-pulse" />
          </div>
          <h3 className="font-medium text-lg">AI обрабатывает запрос</h3>
        </div>
        
        <div className="space-y-3">
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
                    index === currentStep ? 'text-foreground animate-pulse' : 'text-muted-foreground'
                  }`}
                >
                  {step}
                </span>
              </div>
              {index === currentStep && (
                <div className="ml-4 mt-1">
                  <div className="flex space-x-1">
                    <div className="w-1 h-1 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-1 h-1 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-1 h-1 bg-primary rounded-full animate-bounce"></div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
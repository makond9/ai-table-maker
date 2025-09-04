import { useState, useEffect } from 'react';
import { Campaign } from '@/types/campaign';
import { GoogleSheetsTable } from './GoogleSheetsTable';

interface TypingTableAnimationProps {
  campaigns: Campaign[];
  onUpdateCampaign: (id: string, updates: Partial<Campaign>) => void;
  onDeleteCampaign: (id: string) => void;
  isLaunched?: boolean;
  onComplete?: () => void;
}

export function TypingTableAnimation({ 
  campaigns, 
  onUpdateCampaign, 
  onDeleteCampaign, 
  isLaunched = false,
  onComplete 
}: TypingTableAnimationProps) {
  const [typedText, setTypedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [showTable, setShowTable] = useState(false);

  const fullText = `Создаю таблицу с ${campaigns.length} кампанией${campaigns.length > 1 ? 'ми' : ''}...`;

  useEffect(() => {
    if (campaigns.length === 0) {
      setIsTyping(false);
      setShowTable(true);
      onComplete?.();
      return;
    }

    let currentIndex = 0;
    const typingInterval = setInterval(() => {
      if (currentIndex < fullText.length) {
        setTypedText(fullText.slice(0, currentIndex + 1));
        currentIndex++;
      } else {
        clearInterval(typingInterval);
        setTimeout(() => {
          setIsTyping(false);
          setShowTable(true);
          onComplete?.();
        }, 800);
      }
    }, 50); // 50ms задержка между символами

    return () => clearInterval(typingInterval);
  }, [campaigns.length, fullText, onComplete]);

  if (campaigns.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {isTyping && (
        <div className="flex items-center gap-3 p-4 bg-chat-ai-bg rounded-lg border border-border">
          <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
            <div className="w-2 h-2 bg-primary-foreground rounded-full animate-pulse"></div>
          </div>
          <div className="typing-container">
            <span className="text-sm text-chat-ai-text">{typedText}</span>
            <span className="typing-cursor">|</span>
          </div>
        </div>
      )}
      
      {showTable && (
        <div className="animate-fade-in">
          <GoogleSheetsTable
            campaigns={campaigns}
            onUpdateCampaign={onUpdateCampaign}
            onDeleteCampaign={onDeleteCampaign}
            isLaunched={isLaunched}
          />
        </div>
      )}
    </div>
  );
}
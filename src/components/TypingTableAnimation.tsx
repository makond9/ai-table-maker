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
  const [displayedCampaigns, setDisplayedCampaigns] = useState<Campaign[]>([]);
  const [isAnimating, setIsAnimating] = useState(true);

  useEffect(() => {
    if (campaigns.length === 0) {
      setDisplayedCampaigns([]);
      setIsAnimating(false);
      return;
    }

    let currentIndex = 0;
    const animationInterval = setInterval(() => {
      if (currentIndex < campaigns.length) {
        setDisplayedCampaigns(prev => [...prev, campaigns[currentIndex]]);
        currentIndex++;
      } else {
        clearInterval(animationInterval);
        setIsAnimating(false);
        onComplete?.();
      }
    }, 500); // 500ms между появлением каждой строки

    return () => clearInterval(animationInterval);
  }, [campaigns, onComplete]);

  if (campaigns.length === 0) {
    return null;
  }

  return (
    <div className={`transition-opacity duration-300 ${isAnimating ? 'opacity-80' : 'opacity-100'}`}>
      <GoogleSheetsTable
        campaigns={displayedCampaigns}
        onUpdateCampaign={onUpdateCampaign}
        onDeleteCampaign={onDeleteCampaign}
        isLaunched={isLaunched}
      />
      {isAnimating && (
        <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
          Генерирую таблицу...
        </div>
      )}
    </div>
  );
}
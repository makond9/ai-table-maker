import { useState, useEffect } from 'react';
import { Copy, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface CampaignLinkStatusProps {
  campaignId: string;
}

export function CampaignLinkStatus({ campaignId }: CampaignLinkStatusProps) {
  const [status, setStatus] = useState<'waiting' | 'ready'>('waiting');
  const { toast } = useToast();

  useEffect(() => {
    // Через 5 секунд меняем статус на готов
    const timer = setTimeout(() => {
      setStatus('ready');
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const handleCopy = () => {
    const url = `https://clickfeler.com/campaign/${campaignId}`;
    navigator.clipboard.writeText(url);
    toast({
      title: "Ссылка скопирована",
      description: "Ссылка на кампанию скопирована в буфер обмена",
    });
  };

  if (status === 'waiting') {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground animate-pulse">
          Ожидание ссылки от рекламодателя
        </span>
        <div className="flex space-x-1">
          <div className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={handleCopy}
        className="h-8 px-2"
      >
        <Copy className="h-4 w-4" />
      </Button>
    </div>
  );
}
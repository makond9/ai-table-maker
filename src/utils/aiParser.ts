import { Campaign, TRAFFIC_ACCOUNTS, OFFERS, COUNTRIES, RK_OPTIONS, PIXEL_OPTIONS } from '@/types/campaign';

export interface BulkUpdateCommand {
  field: keyof Campaign;
  value: string;
}

export function parseMessage(message: string): Partial<Campaign>[] {
  const lowerMessage = message.toLowerCase();
  const results: Partial<Campaign>[] = [];

  // Определяем трафик аккаунт
  let trafficAccount: Campaign['trafficAccount'] | undefined;
  if (lowerMessage.includes('мета') || lowerMessage.includes('facebook') || lowerMessage.includes('fb')) {
    trafficAccount = 'Мета';
  } else if (lowerMessage.includes('тикток') || lowerMessage.includes('tiktok')) {
    trafficAccount = 'ТикТок';
  }

  // Определяем оффер
  let detectedOffers: string[] = [];
  OFFERS.forEach(offer => {
    if (lowerMessage.includes(offer.toLowerCase())) {
      detectedOffers.push(offer);
    }
  });

  // Специальные случаи для офферов
  if (lowerMessage.includes('финанс') || lowerMessage.includes('банк') || lowerMessage.includes('кредит')) {
    detectedOffers.push('Финансы');
  }
  if (lowerMessage.includes('здоров') || lowerMessage.includes('медиц') || lowerMessage.includes('лечен')) {
    detectedOffers.push('Здоровье');
  }
  if (lowerMessage.includes('крипт') || lowerMessage.includes('bitcoin') || lowerMessage.includes('btc')) {
    detectedOffers.push('Крипто');
  }
  if (lowerMessage.includes('казино') || lowerMessage.includes('ставк') || lowerMessage.includes('игр')) {
    if (!detectedOffers.includes('Игры')) {
      detectedOffers.push('Гемблинг');
    }
  }
  if (lowerMessage.includes('знакомств') || lowerMessage.includes('свидан')) {
    detectedOffers.push('Дейтинг');
  }
  if (lowerMessage.includes('обуч') || lowerMessage.includes('курс') || lowerMessage.includes('образов')) {
    detectedOffers.push('Образование');
  }
  if (lowerMessage.includes('магазин') || lowerMessage.includes('товар') || lowerMessage.includes('продаж')) {
    detectedOffers.push('E-commerce');
  }
  if (lowerMessage.includes('приложен') || lowerMessage.includes('софт') || lowerMessage.includes('программ')) {
    detectedOffers.push('Софт');
  }

  // Определяем страны
  let detectedCountries: string[] = [];
  COUNTRIES.forEach(country => {
    if (lowerMessage.includes(country.toLowerCase())) {
      detectedCountries.push(country);
    }
  });

  // Специальные случаи для стран
  if (lowerMessage.includes('рф') || lowerMessage.includes('россия')) {
    detectedCountries.push('Россия');
  }
  if (lowerMessage.includes('сша') || lowerMessage.includes('америк')) {
    detectedCountries.push('США');
  }
  if (lowerMessage.includes('англ') || lowerMessage.includes('британ')) {
    detectedCountries.push('Великобритания');
  }

  // Убираем дубликаты
  detectedOffers = [...new Set(detectedOffers)];
  detectedCountries = [...new Set(detectedCountries)];

  // Если ничего не найдено, используем значения по умолчанию
  if (detectedOffers.length === 0) {
    detectedOffers = ['Финансы'];
  }
  if (detectedCountries.length === 0) {
    detectedCountries = ['Россия'];
  }
  if (!trafficAccount) {
    trafficAccount = 'Мета';
  }

  // Создаем комбинации кампаний
  detectedOffers.forEach(offer => {
    detectedCountries.forEach(country => {
      results.push({
        trafficAccount,
        offer,
        country,
        rk: RK_OPTIONS[0], // По умолчанию первый РК
        pixel: PIXEL_OPTIONS[0] // По умолчанию первый пиксель
      });
    });
  });

  return results;
}

export function generateAIResponse(campaigns: Partial<Campaign>[]): string {
  if (campaigns.length === 0) {
    return "Не удалось понять запрос. Попробуйте указать трафик-источник (Мета/ТикТок), оффер и страну.";
  }

  if (campaigns.length === 1) {
    const campaign = campaigns[0];
    return `Создана кампания: ${campaign.trafficAccount} - ${campaign.offer} - ${campaign.country}`;
  }

  return `Создано ${campaigns.length} кампаний:
${campaigns.map(c => `• ${c.trafficAccount} - ${c.offer} - ${c.country}`).join('\n')}`;
}

export function parseBulkUpdateCommand(message: string): BulkUpdateCommand | null {
  const lowerMessage = message.toLowerCase();
  
  // Проверяем, что это команда изменения
  if (!lowerMessage.includes('измени')) {
    return null;
  }

  // Определяем поле для изменения
  if (lowerMessage.includes('рк') && lowerMessage.includes('на')) {
    const match = message.match(/рк на (РК-\d{3})/i);
    if (match && RK_OPTIONS.includes(match[1] as any)) {
      return { field: 'rk', value: match[1] };
    }
  }

  if (lowerMessage.includes('пиксель') && lowerMessage.includes('на')) {
    const pixelMatch = PIXEL_OPTIONS.find(pixel => 
      lowerMessage.includes(pixel.toLowerCase())
    );
    if (pixelMatch) {
      return { field: 'pixel', value: pixelMatch };
    }
  }

  if ((lowerMessage.includes('трафик') || lowerMessage.includes('аккаунт')) && lowerMessage.includes('на')) {
    if (lowerMessage.includes('мета') || lowerMessage.includes('facebook')) {
      return { field: 'trafficAccount', value: 'Мета' };
    }
    if (lowerMessage.includes('тикток') || lowerMessage.includes('tiktok')) {
      return { field: 'trafficAccount', value: 'ТикТок' };
    }
  }

  if (lowerMessage.includes('оффер') && lowerMessage.includes('на')) {
    const offerMatch = OFFERS.find(offer => 
      lowerMessage.includes(offer.toLowerCase())
    );
    if (offerMatch) {
      return { field: 'offer', value: offerMatch };
    }
  }

  if (lowerMessage.includes('стран') && lowerMessage.includes('на')) {
    const countryMatch = COUNTRIES.find(country => 
      lowerMessage.includes(country.toLowerCase())
    );
    if (countryMatch) {
      return { field: 'country', value: countryMatch };
    }
    
    // Специальные случаи для стран
    if (lowerMessage.includes('рф') || lowerMessage.includes('россия')) {
      return { field: 'country', value: 'Россия' };
    }
    if (lowerMessage.includes('сша') || lowerMessage.includes('америк')) {
      return { field: 'country', value: 'США' };
    }
  }

  return null;
}

export function generateBulkUpdateResponse(command: BulkUpdateCommand, count: number): string {
  const fieldNames = {
    'rk': 'РК',
    'pixel': 'пиксель',
    'trafficAccount': 'трафик-аккаунт',
    'offer': 'оффер',
    'country': 'страну'
  };

  const fieldName = fieldNames[command.field] || command.field;
  return `Изменил ${fieldName} на "${command.value}" для ${count} кампаний`;
}
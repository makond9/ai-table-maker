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

  // Если ничего не найдено, оставляем undefined для дальнейшего уточнения
  if (detectedOffers.length === 0) {
    detectedOffers = [undefined as any];
  }
  if (detectedCountries.length === 0) {
    detectedCountries = [undefined as any];
  }

  // Создаем комбинации кампаний
  detectedOffers.forEach(offer => {
    detectedCountries.forEach(country => {
      results.push({
        trafficAccount,
        offer,
        country,
        rk: undefined,
        pixel: undefined
      });
    });
  });

  return results;
}

export function generateAIResponse(campaigns: Partial<Campaign>[]): string {
  if (campaigns.length === 0) {
    return "Не удалось понять запрос. Попробуйте указать трафик-источник (Мета/ТикТок), оффер и страну.";
  }

  return `Создано ${campaigns.length} кампаний. ${generateMissingFieldsMessage(campaigns)}`;
}

export function generateMissingFieldsMessage(campaigns: Partial<Campaign>[]): string {
  const allMissingFields = new Set<string>();
  const rowMissingFields: { [key: number]: string[] } = {};

  campaigns.forEach((campaign, index) => {
    const missing: string[] = [];
    
    if (!campaign.trafficAccount) {
      missing.push('трафик-аккаунт');
      allMissingFields.add('трафик-аккаунт');
    }
    if (!campaign.offer) {
      missing.push('оффер');
      allMissingFields.add('оффер');
    }
    if (!campaign.country) {
      missing.push('страну');
      allMissingFields.add('страну');
    }
    if (!campaign.rk) {
      missing.push('РК');
      allMissingFields.add('РК');
    }
    if (!campaign.pixel) {
      missing.push('пиксель');
      allMissingFields.add('пиксель');
    }

    if (missing.length > 0) {
      rowMissingFields[index + 1] = missing;
    }
  });

  if (allMissingFields.size === 0) {
    return "";
  }

  let message = "\n\nНужно уточнить:\n";

  // Если все кампании имеют одинаковые пропущенные поля
  const fieldCounts: { [key: string]: number } = {};
  Object.values(rowMissingFields).forEach(fields => {
    fields.forEach(field => {
      fieldCounts[field] = (fieldCounts[field] || 0) + 1;
    });
  });

  // Поля, которые отсутствуют во всех кампаниях
  const universalMissing = Object.entries(fieldCounts)
    .filter(([field, count]) => count === campaigns.length)
    .map(([field]) => field);

  if (universalMissing.length > 0) {
    message += `• Для всех кампаний: ${universalMissing.join(', ')}\n`;
  }

  // Поля, которые отсутствуют в некоторых кампаниях
  const partialMissing = Object.entries(fieldCounts)
    .filter(([field, count]) => count < campaigns.length && count > 0)
    .map(([field]) => field);

  if (partialMissing.length > 0) {
    partialMissing.forEach(field => {
      const affectedRows = Object.entries(rowMissingFields)
        .filter(([row, fields]) => fields.includes(field))
        .map(([row]) => row);
      
      message += `• ${field} в строках: ${affectedRows.join(', ')}\n`;
    });
  }

  return message;
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
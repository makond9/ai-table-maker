import { Campaign, TONIC_ACCOUNTS, OFFERS, COUNTRIES } from '@/types/campaign';

export interface BulkUpdateCommand {
  field: keyof Campaign;
  value: string;
}

export function parseMessage(message: string): Partial<Campaign>[] {
  const lowerMessage = message.toLowerCase();
  const results: Partial<Campaign>[] = [];

  // Определяем тоник аккаунт
  let tonicAccount: Campaign['tonicAccount'] | undefined;
  if (lowerMessage.includes('мета') || lowerMessage.includes('facebook') || lowerMessage.includes('fb')) {
    tonicAccount = 'Мета';
  } else if (lowerMessage.includes('тикток') || lowerMessage.includes('tiktok')) {
    tonicAccount = 'ТикТок';
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
        tonicAccount,
        offer,
        country
      });
    });
  });

  return results;
}

export function generateAIResponse(campaigns: Partial<Campaign>[]): string {
  if (campaigns.length === 0) {
    return "Не удалось понять запрос. Попробуйте указать тоник аккаунт (Мета/ТикТок), оффер и страну.";
  }

  return `Создано ${campaigns.length} кампаний. ${generateMissingFieldsMessage(campaigns)}`;
}

export function generateMissingFieldsMessage(campaigns: Partial<Campaign>[]): string {
  const allMissingFields = new Set<string>();
  const rowMissingFields: { [key: number]: string[] } = {};

  campaigns.forEach((campaign, index) => {
    const missing: string[] = [];
    
    if (!campaign.tonicAccount) {
      missing.push('тоник аккаунт');
      allMissingFields.add('тоник аккаунт');
    }
    if (!campaign.offer) {
      missing.push('оффер');
      allMissingFields.add('оффер');
    }
    if (!campaign.country) {
      missing.push('страну');
      allMissingFields.add('страну');
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

  if ((lowerMessage.includes('тоник') || lowerMessage.includes('аккаунт')) && lowerMessage.includes('на')) {
    if (lowerMessage.includes('мета') || lowerMessage.includes('facebook')) {
      return { field: 'tonicAccount', value: 'Мета' };
    }
    if (lowerMessage.includes('тикток') || lowerMessage.includes('tiktok')) {
      return { field: 'tonicAccount', value: 'ТикТок' };
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
    'tonicAccount': 'тоник аккаунт',
    'offer': 'оффер',
    'country': 'страну'
  };

  const fieldName = fieldNames[command.field] || command.field;
  return `Изменил ${fieldName} на "${command.value}" для ${count} кампаний`;
}
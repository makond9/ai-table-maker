import { Campaign, TONIC_ACCOUNTS, OFFERS, COUNTRIES } from '@/types/campaign';

export interface AIParsingResult {
  campaigns?: Partial<Campaign>[];
  bulkUpdate?: {
    field: keyof Campaign;
    value: string;
  };
  message: string;
}

export class AIService {
  private apiKey: string | null = null;

  setApiKey(key: string) {
    this.apiKey = key;
  }

  hasApiKey(): boolean {
    return !!this.apiKey;
  }

  async parseCommandWithAI(message: string): Promise<AIParsingResult> {
    if (!this.apiKey) {
      throw new Error('API ключ не установлен');
    }

    const systemPrompt = `Ты - эксперт по анализу команд для создания рекламных кампаний. 

Доступные параметры:
- Тоник аккаунты: ${TONIC_ACCOUNTS.join(', ')}
- Офферы: ${OFFERS.join(', ')}
- Страны: ${COUNTRIES.join(', ')}

Твоя задача - распознать из текста пользователя одно из действий:
1. Создание новых кампаний (с комбинациями параметров)
2. Массовое изменение существующих кампаний

Для создания кампаний верни:
{
  "action": "create",
  "campaigns": [
    {
      "tonicAccount": "...",
      "offer": "...",
      "country": "..."
    }
  ],
  "message": "Создано X кампаний: ..."
}

Для массового изменения верни:
{
  "action": "bulk_update", 
  "field": "tonicAccount|offer|country",
  "value": "новое значение",
  "message": "Изменил ... на ..."
}

Если команда непонятна:
{
  "action": "error",
  "message": "Не удалось понять команду. Укажите..."
}

Анализируй синонимы: Мета=Facebook, ТикТок=TikTok, РФ=Россия, США=Америка и т.д.
Создавай все возможные комбинации если указано несколько параметров.
Отвечай ТОЛЬКО валидным JSON.`;

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-5-2025-08-07',
          messages: [
            {
              role: 'system',
              content: systemPrompt
            },
            {
              role: 'user',
              content: message
            }
          ],
          temperature: 0.1,
          max_tokens: 1000,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      const aiResponse = data.choices[0]?.message?.content;

      if (!aiResponse) {
        throw new Error('Пустой ответ от API');
      }

      try {
        const parsedResponse = JSON.parse(aiResponse);
        
        switch (parsedResponse.action) {
          case 'create':
            return {
              campaigns: parsedResponse.campaigns,
              message: parsedResponse.message
            };
          
          case 'bulk_update':
            return {
              bulkUpdate: {
                field: parsedResponse.field,
                value: parsedResponse.value
              },
              message: parsedResponse.message
            };
          
          default:
            return {
              message: parsedResponse.message || 'Не удалось понять команду'
            };
        }
      } catch (parseError) {
        console.error('Ошибка парсинга ответа ИИ:', parseError);
        return {
          message: 'Ошибка обработки ответа ИИ. Попробуйте переформулировать запрос.'
        };
      }
    } catch (error) {
      console.error('Ошибка API:', error);
      return {
        message: `Ошибка подключения к ИИ: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`
      };
    }
  }

  // Fallback на локальный парсинг если нет API ключа
  parseCommandLocally(message: string): AIParsingResult {
    const lowerMessage = message.toLowerCase();
    
    // Проверяем команды изменения
    if (lowerMessage.includes('измени')) {
      const bulkUpdate = this.parseBulkUpdateLocal(message);
      if (bulkUpdate) {
        return {
          bulkUpdate,
          message: `Изменил ${this.getFieldName(bulkUpdate.field)} на "${bulkUpdate.value}"`
        };
      }
    }

    // Парсим создание кампаний
    const campaigns = this.parseMessageLocal(message);
    if (campaigns.length > 0) {
      return {
        campaigns,
        message: campaigns.length === 1 
          ? `Компания добавлена - проверьте параметры: ${campaigns[0].tonicAccount} - ${campaigns[0].offer} - ${campaigns[0].country}`
          : `Компании добавлены - проверьте параметры (${campaigns.length} шт.)`
      };
    }

    return {
      message: "Не удалось понять запрос. Попробуйте указать тоник аккаунт, оффер и страну."
    };
  }

  private parseMessageLocal(message: string): Partial<Campaign>[] {
    const lowerMessage = message.toLowerCase();
    const results: Partial<Campaign>[] = [];

    // Определяем тоник аккаунт
    let tonicAccount: Campaign['tonicAccount'] | undefined;
    if (lowerMessage.includes('мета') || lowerMessage.includes('facebook') || lowerMessage.includes('fb')) {
      tonicAccount = 'Мета';
    } else if (lowerMessage.includes('тикток') || lowerMessage.includes('tiktok')) {
      tonicAccount = 'ТикТок';
    }

    // Определяем офферы
    let detectedOffers: string[] = [];
    OFFERS.forEach(offer => {
      if (lowerMessage.includes(offer.toLowerCase())) {
        detectedOffers.push(offer);
      }
    });

    // Определяем страны
    let detectedCountries: string[] = [];
    COUNTRIES.forEach(country => {
      if (lowerMessage.includes(country.toLowerCase())) {
        detectedCountries.push(country);
      }
    });

    // Специальные случаи
    if (lowerMessage.includes('рф') || lowerMessage.includes('россия')) {
      detectedCountries.push('Россия');
    }

    // Устанавливаем значения по умолчанию
    if (detectedOffers.length === 0) detectedOffers = ['Финансы'];
    if (detectedCountries.length === 0) detectedCountries = ['Россия'];
    if (!tonicAccount) tonicAccount = 'Мета';

    // Создаем комбинации
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

  private parseBulkUpdateLocal(message: string): { field: keyof Campaign; value: string } | null {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('тоник') && lowerMessage.includes('на')) {
      if (lowerMessage.includes('мета')) {
        return { field: 'tonicAccount', value: 'Мета' };
      } else if (lowerMessage.includes('тикток')) {
        return { field: 'tonicAccount', value: 'ТикТок' };
      }
    }

    return null;
  }

  private getFieldName(field: keyof Campaign): string {
    const fieldNames: Record<string, string> = {
      'tonicAccount': 'тоник аккаунт',
      'offer': 'оффер',
      'country': 'страну'
    };
    return fieldNames[field] || field;
  }
}

export const aiService = new AIService();
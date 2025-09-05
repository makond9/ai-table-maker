export interface Campaign {
  id: string;
  tonicAccount?: 'Мета' | 'ТикТок';
  offer?: string;
  country?: string;
  campaignName?: string;
  campaignUrl?: string;
  createdAt: Date;
}

export const TONIC_ACCOUNTS = ['Мета', 'ТикТок'] as const;

export const OFFERS = [
  'Финансы',
  'Здоровье',
  'Крипто',
  'Нутра',
  'Гемблинг',
  'Дейтинг',
  'Образование',
  'E-commerce',
  'Игры',
  'Софт'
] as const;

export const COUNTRIES = [
  'Россия',
  'США',
  'Германия',
  'Франция',
  'Великобритания',
  'Италия',
  'Испания',
  'Польша',
  'Украина',
  'Казахстан',
  'Беларусь',
  'Китай',
  'Япония',
  'Южная Корея',
  'Индия',
  'Бразилия',
  'Мексика',
  'Канада',
  'Австралия',
  'Турция'
] as const;

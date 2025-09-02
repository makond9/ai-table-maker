export interface Campaign {
  id: string;
  trafficAccount: 'Мета' | 'ТикТок';
  offer: string;
  country: string;
  createdAt: Date;
}

export const TRAFFIC_ACCOUNTS = ['Мета', 'ТикТок'] as const;

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
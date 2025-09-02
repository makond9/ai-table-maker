export interface Campaign {
  id: string;
  trafficAccount: 'Мета' | 'ТикТок';
  offer: string;
  country: string;
  rk: string;
  pixel: string;
  campaignName?: string;
  campaignUrl?: string;
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

export const RK_OPTIONS = [
  'РК-001',
  'РК-002',
  'РК-003',
  'РК-004',
  'РК-005',
  'РК-006',
  'РК-007',
  'РК-008',
  'РК-009',
  'РК-010'
] as const;

export const PIXEL_OPTIONS = [
  'Facebook Pixel',
  'Google Analytics',
  'TikTok Pixel',
  'Yandex Metrica',
  'MyTarget',
  'VK Pixel',
  'Custom Pixel 1',
  'Custom Pixel 2',
  'Custom Pixel 3',
  'Custom Pixel 4'
] as const;
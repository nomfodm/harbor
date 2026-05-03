export type PageId = 'main' | 'launcher' | 'login' | 'register' | 'pa' | 'verify';
export type Theme = 'dark' | 'light';
export type HeroVariant = 'cosmic' | 'arcade';

export interface User {
  username: string;
  email: string;
  registeredAt: string;
  isActive: boolean;
  isBanned: boolean;
  isPermanent: boolean;
  bannedTill: string | null;
  avatarUrl: string | null;
}

export type Navigate = (page: PageId) => void;

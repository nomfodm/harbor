import type { Dispatch, SetStateAction } from 'react';

export type PageId = 'main' | 'launcher' | 'login' | 'register' | 'pa';
export type Theme = 'dark' | 'light';
export type HeroVariant = 'cosmic' | 'arcade';

export interface User {
  username: string;
  email: string;
}

export type Navigate = (page: PageId) => void;
export type SetUser = Dispatch<SetStateAction<User | null>>;

export interface TweakValues {
  heroVariant: HeroVariant;
}

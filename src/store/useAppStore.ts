import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Theme, User } from '../types';

interface AppStore {
  user: User | null;
  token: string | null;
  theme: Theme;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  toggleTheme: () => void;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      theme: 'dark',
      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),
      toggleTheme: () => set((s) => ({ theme: s.theme === 'dark' ? 'light' : 'dark' })),
    }),
    { name: 'app-store' },
  ),
);

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ThemeStore {
  theme: 'dark' | 'light';
  toggle: () => void;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      theme: 'dark',
      toggle: () => {
        const next = get().theme === 'dark' ? 'light' : 'dark';
        set({ theme: next });
        document.documentElement.classList.toggle('dark', next === 'dark');
      },
    }),
    { name: 'fightclub-theme' },
  ),
);

export function initTheme() {
  const stored = localStorage.getItem('fightclub-theme');
  const theme = stored ? (JSON.parse(stored).state?.theme ?? 'dark') : 'dark';
  document.documentElement.classList.toggle('dark', theme === 'dark');
}

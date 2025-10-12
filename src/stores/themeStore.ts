import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { TThemeStore } from '#/contracts/theme/IThemeStore';
import type { TTheme } from '#/contracts/theme/TTheme';

const applyTheme = (theme: TTheme) => {
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
};

const applyLocale = (locale: TThemeStore['locale']) => {
  document.documentElement.setAttribute('lang', locale);
};

export const useThemeStore = create<TThemeStore>()(
  persist(
    (set, get) => ({
      theme: 'light',
      locale: 'en',
      toggleTheme: () =>
        set((state) => {
          const newTheme = state.theme === 'light' ? 'dark' : 'light';
          applyTheme(newTheme);
          return { theme: newTheme };
        }),
      setTheme: (theme) =>
        set(() => {
          applyTheme(theme);
          return { theme };
        }),
      getLocale: () => get().locale,
      setLocale: (locale) =>
        set(() => {
          applyLocale(locale);
          return { locale };
        }),
    }),
    {
      name: 'json-byte-theme',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        // Apply theme and locale when rehydrated from localStorage
        if (state) {
          applyTheme(state.theme);
          applyLocale(state.locale);
        }
      },
    },
  ),
);

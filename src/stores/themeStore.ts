import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { IThemeStore } from '#/contracts/theme/IThemeStore';
import type { TTheme } from '#/contracts/theme/TTheme';

const applyTheme = (theme: TTheme) => {
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
};

export const useThemeStore = create<IThemeStore>()(
  persist(
    (set) => ({
      theme: 'light',
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
    }),
    {
      name: 'json-byte-theme',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        // Apply theme when rehydrated from localStorage
        if (state) {
          applyTheme(state.theme);
        }
      },
    },
  ),
);

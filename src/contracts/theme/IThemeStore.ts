import type { TTheme } from '#/contracts/theme/TTheme';

export interface IThemeStore {
  locale: 'en' | 'ko';
  theme: TTheme;

  toggleTheme: () => void;
  setTheme: (theme: TTheme) => void;
  getLocale: () => 'en' | 'ko';
  setLocale: (locale: 'en' | 'ko') => void;
}

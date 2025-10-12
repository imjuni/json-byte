import type { TTheme } from '#/contracts/theme/TTheme';

// State
interface IThemeStoreValue {
  locale: 'en' | 'ko';
  theme: TTheme;
}

// Actions
interface IThemeStoreAction {
  toggleTheme: () => void;
  setTheme: (theme: TTheme) => void;
  getLocale: () => 'en' | 'ko';
  setLocale: (locale: 'en' | 'ko') => void;
}

export type TThemeStore = IThemeStoreValue & IThemeStoreAction;

import type { TTheme } from '#/contracts/theme/TTheme';

export interface IThemeStore {
  theme: TTheme;
  toggleTheme: () => void;
  setTheme: (theme: TTheme) => void;
}

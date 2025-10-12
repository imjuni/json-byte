import { getOrDefault } from '#/lib/getOrDefault';
import { safeParse } from '#/lib/json/safeParse';

import type { TThemeStore } from '#/contracts/theme/IThemeStore';

export function getInitialLocale(): TThemeStore['locale'] {
  try {
    const theme = getOrDefault(localStorage.getItem('json-byte-theme'), '{}');
    const parsed = safeParse(theme);

    if (parsed instanceof Error) {
      return 'en';
    }

    const { locale } = parsed as unknown as TThemeStore;

    if (locale != null && (locale === 'en' || locale === 'ko')) {
      return locale;
    }

    return 'en';
  } catch {
    return 'en';
  }
}

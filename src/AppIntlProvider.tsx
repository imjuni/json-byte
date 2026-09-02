import { useMemo } from 'react';

import { flatten } from 'flat';
import { IntlProvider } from 'react-intl';

import { useThemeStore } from '#/stores/themeStore';

import type { PropsWithChildren } from 'react';

const messages = import.meta.glob('./i18n/*.json', { eager: true });

export const AppIntlProvider = ({ children }: PropsWithChildren) => {
  const locale = useThemeStore((state) => state.locale);

  const message = useMemo<Record<string, string>>(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    () => flatten((messages[`./i18n/${locale}.json`] as any).default),
    [locale],
  );

  return (
    <IntlProvider defaultLocale="en" locale={locale} messages={message}>
      {children}
    </IntlProvider>
  );
};

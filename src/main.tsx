import { StrictMode } from 'react';

import { createRoot } from 'react-dom/client';
import { IntlProvider } from 'react-intl';

import { App } from './App';
import './index.css';

const messages = import.meta.glob('./i18n/*.json', { eager: true });
const locale = localStorage.getItem('locale') ?? 'en';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const message = (messages[`./i18n/${locale}.json`] as any).default;

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <IntlProvider defaultLocale="en" locale={locale} messages={message as Record<string, string>}>
      <App />
    </IntlProvider>
  </StrictMode>,
);

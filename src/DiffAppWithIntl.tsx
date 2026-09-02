import { AppIntlProvider } from './AppIntlProvider';
import { DiffApp } from './DiffApp';

export const DiffAppWithIntl = () => (
  <AppIntlProvider>
    <DiffApp />
  </AppIntlProvider>
);

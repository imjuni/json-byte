import { StrictMode } from 'react';

import { createRoot } from 'react-dom/client';

import { AppWithIntl } from './AppWithIntl';
import './index.css';

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppWithIntl />
  </StrictMode>,
);

import { DiffWorkspace } from '#/components/diff/DiffWorkspace';
import { AppShell } from '#/components/layout/AppShell';

import './App.css';

export const DiffApp = () => (
  <AppShell activePage="diff">
    <DiffWorkspace />
  </AppShell>
);

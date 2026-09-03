import { FooterEditorStatus, FooterThemeStatus } from '#/components/layout/FooterEditorStatus';
import { Nav } from '#/components/nav/Nav';
import { Notification } from '#/components/nav/Notification';

import type { PropsWithChildren } from 'react';

import type { TWorkspacePage } from '#/components/nav/Nav';

interface IAppShellProps extends PropsWithChildren {
  activePage: TWorkspacePage;
}

export const AppShell = ({ activePage, children }: IAppShellProps) => (
  <div className="flex flex-col w-full h-full">
    <Nav activePage={activePage} />
    <Notification />

    <main className="flex-1 mt-13 overflow-y-scroll md:overflow-hidden">{children}</main>

    <footer className="h-6 px-4 bg-card border-t flex items-center justify-between text-xs text-muted-foreground">
      {activePage === 'visualization' ? <FooterEditorStatus /> : <FooterThemeStatus compact={false} />}
      <div className="flex gap-4">
        <span>© 2025 JSON Byte</span>

        <a
          className="hover:text-foreground transition-colors"
          href="https://rovinjsoft.com/"
          rel="noreferrer"
          target="_blank"
        >
          <span className="font-bold">Rovinj Soft Co.</span>
        </a>
      </div>
    </footer>
  </div>
);

import { Moon, Sun } from 'lucide-react';

import { LocaleDropdown } from '#/components/nav/LocaleDropdown';
import { Button } from '#/components/ui/button';
import { Label } from '#/components/ui/label';
import { useThemeStore } from '#/stores/themeStore';

export type TWorkspacePage = 'visualization' | 'diff';

interface INavProps {
  activePage: TWorkspacePage;
}

const workspaceLinkClassName =
  'relative flex items-center px-4 text-sm font-medium transition-colors after:absolute after:inset-x-4 after:bottom-0 after:h-0.5 after:rounded-full';

export const Nav = ({ activePage }: INavProps) => {
  const { theme, toggleTheme } = useThemeStore();

  return (
    <nav className="absolute top-0 left-0 m-0 w-full h-12 shadow-sm bg-card border-b border-border flex items-center justify-between px-4">
      <div className="flex text-foreground font-bold justify-center items-center gap-2">
        <img alt="JSON Byte Logo" className="w-8 h-8" src="/json-byte-favicon.png" />
        <div className="flex">
          <a href="https://json-byte.pages.dev/">JSON Byte</a>
        </div>
      </div>

      <div className="flex flex-1 justify-center self-stretch">
        <nav aria-label="Workspace" className="flex items-stretch">
          <a
            aria-current={activePage === 'visualization' ? 'page' : undefined}
            className={`${workspaceLinkClassName} ${activePage === 'visualization' ? 'text-foreground after:bg-primary' : 'text-muted-foreground hover:text-foreground after:bg-transparent'}`}
            href="/"
          >
            Visualization
          </a>
          <a
            aria-current={activePage === 'diff' ? 'page' : undefined}
            className={`${workspaceLinkClassName} ${activePage === 'diff' ? 'text-foreground after:bg-primary' : 'text-muted-foreground hover:text-foreground after:bg-transparent'}`}
            href="/diff/"
          >
            Diff
          </a>
        </nav>
      </div>

      <div className="flex gap-4">
        <div className="flex justify-center items-center">
          <a className="w-7 h-7" href="https://github.com/imjuni/json-byte" id="navigation-github-link">
            <Label className="hidden" htmlFor="navigation-github-link">
              Github Link
            </Label>
            {theme === 'dark' ? (
              <img alt="Github link icon file" src="https://cdn.simpleicons.org/github/ffffff" />
            ) : (
              <img alt="Github link icon file" src="https://cdn.simpleicons.org/github/000000" />
            )}
          </a>
        </div>

        <LocaleDropdown />

        <Button onClick={toggleTheme} variant="ghost">
          {theme === 'light' ? <Sun /> : <Moon />}
        </Button>
      </div>
    </nav>
  );
};

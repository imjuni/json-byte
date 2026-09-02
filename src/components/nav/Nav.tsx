import { Moon, Sun } from 'lucide-react';

import { LocaleDropdown } from '#/components/nav/LocaleDropdown';
import { Button } from '#/components/ui/button';
import { Label } from '#/components/ui/label';
import { useAppStore } from '#/stores/appStore';
import { useThemeStore } from '#/stores/themeStore';

export const Nav = () => {
  const { theme, toggleTheme } = useThemeStore();
  const { view, setView } = useAppStore();

  return (
    <nav className="absolute top-0 left-0 m-0 w-full h-12 shadow-sm bg-card border-b border-border flex items-center justify-between px-4">
      <div className="flex text-foreground font-bold justify-center items-center gap-2">
        <img alt="JSON Byte Logo" className="w-8 h-8" src="/json-byte-favicon.png" />
        <div className="flex">
          <a href="https://json-byte.pages.dev/">JSON Byte</a>
        </div>
      </div>

      <div className="flex flex-1 justify-center self-stretch">
        <div aria-label="Workspace" className="flex items-stretch" role="tablist">
          <button
            aria-selected={view === 'visualization'}
            className="relative px-4 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground aria-selected:text-foreground after:absolute after:inset-x-4 after:bottom-0 after:h-0.5 after:rounded-full after:bg-transparent aria-selected:after:bg-primary"
            onClick={() => setView('visualization')}
            role="tab"
            type="button"
          >
            Visualization
          </button>
          <button
            aria-selected={view === 'diff'}
            className="relative px-4 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground aria-selected:text-foreground after:absolute after:inset-x-4 after:bottom-0 after:h-0.5 after:rounded-full after:bg-transparent aria-selected:after:bg-primary"
            onClick={() => setView('diff')}
            role="tab"
            type="button"
          >
            Diff
          </button>
        </div>
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

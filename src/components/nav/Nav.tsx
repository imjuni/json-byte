import { Moon, Sun } from 'lucide-react';

import { LocaleDropdown } from '#/components/nav/LocaleDropdown';
import { Button } from '#/components/ui/button';
import { Label } from '#/components/ui/label';
import { useThemeStore } from '#/stores/themeStore';

export const Nav = () => {
  const { theme, toggleTheme } = useThemeStore();

  return (
    <nav className="absolute top-0 left-0 m-0 w-full h-12 shadow-sm bg-card border-b border-border flex items-center justify-between px-4">
      <div className="flex text-foreground font-bold">JSON Byte</div>

      <div className="flex flex-1"> </div>

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

import { Moon, Sun } from 'lucide-react';

import { LocaleDropdown } from '#/components/nav/LocaleDropdown';
import { Button } from '#/components/ui/button';
import { useThemeStore } from '#/stores/themeStore';

export const Nav = () => {
  const { theme, toggleTheme } = useThemeStore();

  return (
    <nav className="absolute top-0 left-0 m-0 w-full h-12 shadow-sm bg-card border-b border-border flex items-center justify-between px-4">
      <div className="flex text-foreground font-bold">JSON Byte</div>

      <div className="flex flex-1"> </div>

      <div className="flex">
        <LocaleDropdown />
        <Button onClick={toggleTheme} variant="ghost">
          {theme === 'light' ? <Sun /> : <Moon />}
        </Button>
      </div>
    </nav>
  );
};

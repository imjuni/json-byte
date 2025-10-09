import { Moon, Sun } from 'lucide-react';

import { Button } from '#/components/ui/button';
import { useThemeStore } from '#/stores/themeStore';

export const Nav = () => {
  const { theme, toggleTheme } = useThemeStore();

  return (
    <nav className="absolute top-0 left-0 m-0 w-full h-12 shadow-sm bg-card border-b border-border flex items-center justify-between px-4">
      <div className="text-foreground font-bold">JSON Byte</div>

      <Button onClick={toggleTheme} variant="ghost">
        {theme === 'light' ? <Sun /> : <Moon />}
      </Button>
    </nav>
  );
};

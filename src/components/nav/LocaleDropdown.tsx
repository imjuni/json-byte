import { clsx } from 'clsx';
import { Languages } from 'lucide-react';

import { Button } from '#/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '#/components/ui/dropdown-menu';
import { useThemeStore } from '#/stores/themeStore';

export const LocaleDropdown = () => {
  const { locale, setLocale } = useThemeStore();

  const handleLocaleChange = (selected: 'en' | 'ko') => {
    setLocale(selected);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          <Languages />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-36 mx-[1rem]">
        <DropdownMenuGroup>
          <DropdownMenuItem
            className="data-[disabled]:pointer-events-none"
            disabled={locale === 'en'}
            onClick={() => handleLocaleChange('en')}
            style={{ opacity: 1 }}
          >
            <span
              className={clsx({
                'font-bold': locale === 'en',
                'text-blue-500': locale === 'en',
              })}
            >
              English
            </span>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="data-[disabled]:pointer-events-none"
            disabled={locale === 'ko'}
            onClick={() => handleLocaleChange('ko')}
            style={{ opacity: 1 }}
          >
            <span
              className={clsx({
                'font-bold': locale === 'ko',
                'text-blue-500': locale === 'ko',
              })}
            >
              Korean
            </span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

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
  const { setLocale } = useThemeStore();

  const handleLocaleChange = (locale: 'en' | 'ko') => {
    setLocale(locale);
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
          <DropdownMenuItem onClick={() => handleLocaleChange('en')}>English</DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleLocaleChange('ko')}>Korean</DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

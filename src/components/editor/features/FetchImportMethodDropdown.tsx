import clsx from 'clsx';
import { Controller } from 'react-hook-form';

import { Button } from '#/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '#/components/ui/dropdown-menu';

import type { UseFormReturn } from 'react-hook-form';

import type { TApiFetchFormSchema } from '#/components/editor/schemas/apiFetchFormSchema';

const METHODS = [
  'get',
  'post',
  'put',
  'patch',
  'delete',
  'search',
  'head',
  'options',
  'purge',
  'link',
  'unlink',
] as const;

export const FetchImportMethodDropdown = ({ form }: { form: UseFormReturn<TApiFetchFormSchema> }) => (
  <Controller
    control={form.control}
    name="method"
    render={({ field }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">
            {field.value.slice(0, 1).toUpperCase()}
            {field.value.slice(1)}
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="start" className="w-30">
          <DropdownMenuLabel>Method</DropdownMenuLabel>
          <DropdownMenuGroup>
            {METHODS.map((methodValue) => (
              <DropdownMenuItem
                key={methodValue}
                className="data-[disabled]:pointer-events-none"
                disabled={field.value === methodValue}
                onClick={() => field.onChange(methodValue)}
                style={{ opacity: 1 }}
              >
                <span
                  className={clsx({
                    'font-bold': field.value === methodValue,
                    'text-blue-500': field.value === methodValue,
                  })}
                >
                  {methodValue.slice(0, 1).toUpperCase() + methodValue.slice(1)}
                </span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    )}
  />
);

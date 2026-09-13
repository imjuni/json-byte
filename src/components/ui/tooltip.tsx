import * as TooltipPrimitive from '@radix-ui/react-tooltip';

import { cn } from '#/lib/utils';

import type { ComponentProps } from 'react';

export const TooltipProvider = TooltipPrimitive.Provider;
export const Tooltip = TooltipPrimitive.Root;
export const TooltipTrigger = TooltipPrimitive.Trigger;

export const TooltipContent = ({
  className,
  sideOffset = 6,
  children,
  ...props
}: ComponentProps<typeof TooltipPrimitive.Content>) => (
  <TooltipPrimitive.Portal>
    <TooltipPrimitive.Content
      data-slot="tooltip-content"
      sideOffset={sideOffset}
      className={cn(
        'z-50 max-w-[var(--radix-tooltip-content-available-width)] origin-(--radix-tooltip-content-transform-origin) rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=top]:slide-in-from-bottom-2 data-[side=bottom]:slide-in-from-top-2 motion-reduce:animate-none',
        className,
      )}
      {...props}
    >
      {children}
      <TooltipPrimitive.Arrow className="fill-primary" />
    </TooltipPrimitive.Content>
  </TooltipPrimitive.Portal>
);

import { Tooltip, TooltipContent, TooltipTrigger } from '#/components/ui/tooltip';

import type { ReactElement } from 'react';

export const ToolbarTooltip = ({ children, label }: { children: ReactElement; label: string }) => (
  <Tooltip>
    <TooltipTrigger asChild>{children}</TooltipTrigger>
    <TooltipContent side="top">{label}</TooltipContent>
  </Tooltip>
);

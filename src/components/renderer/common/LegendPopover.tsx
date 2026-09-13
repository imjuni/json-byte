import { Info as IconInfo } from 'lucide-react';
import { tv } from 'tailwind-variants';

import { FieldValue } from '#/components/renderer/common/FieldValue';
import { ToolbarTooltip } from '#/components/renderer/common/ToolbarTooltip';
import { TypeDisc } from '#/components/renderer/common/TypeDisc';
import { Button } from '#/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '#/components/ui/popover';

const variants = tv({
  slots: {
    line: 'flex px-4 gap-2',
  },
});

const { line } = variants();

export const LegendPopover = () => (
  <Popover>
    <ToolbarTooltip label="Type legend">
      <PopoverTrigger asChild>
        <Button aria-label="Type legend" size="icon" variant="ghost">
          <IconInfo />
        </Button>
      </PopoverTrigger>
    </ToolbarTooltip>

    <PopoverContent className="w-40 px-2" side="top">
      <div className={line()}>
        <TypeDisc type="string" />
        <FieldValue type="string" value="String" />
      </div>
      <div className={line()}>
        <TypeDisc type="number" />
        <FieldValue type="number" value="Number" />
      </div>
      <div className={line()}>
        <TypeDisc type="boolean" />
        <FieldValue type="boolean" value="Boolean" />
      </div>
      <div className={line()}>
        <TypeDisc type="object" />
        <FieldValue type="object" value="Object" />
      </div>
      <div className={line()}>
        <TypeDisc type="array" />
        <FieldValue type="array" value="Array" />
      </div>
    </PopoverContent>
  </Popover>
);

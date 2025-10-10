import { Info as IconInfo } from 'lucide-react';
import { tv } from 'tailwind-variants';

import { FieldValue } from '#/components/renderer/xyflow/FieldValue';
import { TypeDisc } from '#/components/renderer/xyflow/TypeDisc';
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
    <PopoverTrigger asChild>
      <Button variant="outline">
        <IconInfo />
      </Button>
    </PopoverTrigger>

    <PopoverContent className="w-40 px-2">
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

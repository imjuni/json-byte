import { Info as IconInfo } from 'lucide-react';
import { useIntl } from 'react-intl';

import { FieldValue } from '#/components/renderer/common/FieldValue';
import { ToolbarTooltip } from '#/components/renderer/common/ToolbarTooltip';
import { TypeDisc } from '#/components/renderer/common/TypeDisc';
import { Button } from '#/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '#/components/ui/dialog';

import type { TPrimitiveTypeString } from '#/contracts/json/TPrimitiveTypeString';

const types: { label: string; type: TPrimitiveTypeString | 'object' | 'array' }[] = [
  { label: 'String', type: 'string' },
  { label: 'Number', type: 'number' },
  { label: 'Boolean', type: 'boolean' },
  { label: 'Null', type: 'null' },
  { label: 'Object', type: 'object' },
  { label: 'Array', type: 'array' },
];

const identifyKeys = (keys: readonly string[]) => {
  const occurrences = new Map<string, number>();
  return keys.map((key) => {
    const occurrence = (occurrences.get(key) ?? 0) + 1;
    occurrences.set(key, occurrence);
    return { id: `${key}-${occurrence}`, label: key };
  });
};

const KeySequence = ({ keys }: { keys: readonly string[] }) => (
  <span aria-label={keys.join(' ')} className="flex shrink-0 flex-wrap items-center justify-end gap-1">
    {identifyKeys(keys).map(({ id, label }) =>
      label === '/' || label === '+' ? (
        <span key={id} aria-hidden="true" className="px-0.5 text-xs text-muted-foreground">
          {label}
        </span>
      ) : (
        <kbd
          key={id}
          className="inline-flex min-h-7 min-w-7 items-center justify-center rounded-md border border-b-[3px] border-border border-b-muted-foreground/40 bg-background px-2 pb-1 pt-0.5 font-mono text-xs font-medium text-foreground shadow-sm"
        >
          {label}
        </kbd>
      ),
    )}
  </span>
);

const Shortcut = ({ keys, label }: { keys: readonly string[]; label: string }) => (
  <div className="flex items-center justify-between gap-4 py-1.5 text-sm">
    <span>{label}</span>
    <KeySequence keys={keys} />
  </div>
);

export const GraphInfoDialog = () => {
  const intl = useIntl();
  const message = (id: string) => intl.formatMessage({ id: `graph.info-dialog.${id}` });

  return (
    <Dialog>
      <ToolbarTooltip label={message('title')}>
        <DialogTrigger asChild>
          <Button aria-label={message('title')} size="icon" variant="ghost">
            <IconInfo />
          </Button>
        </DialogTrigger>
      </ToolbarTooltip>

      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{message('title')}</DialogTitle>
          <DialogDescription>{message('description')}</DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 sm:grid-cols-2">
          <section>
            <h3 className="mb-2 text-sm font-semibold">{message('type-legend')}</h3>
            <div className="grid grid-cols-2 gap-x-4 rounded-md border p-3">
              {types.map(({ label, type }) => (
                <div key={type} className="flex items-center gap-2 py-1">
                  <TypeDisc type={type} />
                  <FieldValue type={type} value={label} />
                </div>
              ))}
            </div>
          </section>

          <section>
            <h3 className="mb-2 text-sm font-semibold">{message('shortcuts')}</h3>
            <div className="divide-y rounded-md border px-3">
              <Shortcut keys={['⌘', '/', 'Ctrl', 'K']} label={message('search-nodes')} />
              <Shortcut keys={['⌘', '/', 'Ctrl', '⇧', 'K']} label={message('search-path')} />
              <Shortcut keys={['Esc']} label={message('close-search')} />
            </div>
          </section>
        </div>

        <section>
          <h3 className="mb-2 text-sm font-semibold">{message('navigation')}</h3>
          <div className="grid gap-x-6 rounded-md border px-3 sm:grid-cols-2">
            <Shortcut keys={[message('drag-key')]} label={message('pan')} />
            <Shortcut keys={[message('wheel-key')]} label={message('vertical-pan')} />
            <Shortcut keys={['Shift', '+', message('wheel-key')]} label={message('horizontal-pan')} />
            <Shortcut keys={['⌘', '/', 'Ctrl', '+', message('wheel-key')]} label={message('zoom')} />
          </div>
        </section>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">{message('action-close')}</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

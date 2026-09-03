import { useCallback, useEffect, useRef, useState } from 'react';

import { githubDarkTheme, githubLightTheme, JsonEditor } from 'json-edit-react';
import { Copy } from 'lucide-react';
import { useIntl } from 'react-intl';

import { Button } from '#/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '#/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '#/components/ui/popover';
import { jsonPathToJqPath } from '#/lib/parser/json/jsonPathToJqPath';
import { useThemeStore } from '#/stores/themeStore';

import type { IGraphNode } from '#/lib/graph/interfaces/IGraphNode';

interface IPixiNodeDetailsDialogProps {
  node: IGraphNode | null;
  onClose: () => void;
  onFindInEditor: (node: IGraphNode) => void;
}

export const PixiNodeDetailsDialog = ({ node, onClose, onFindInEditor }: IPixiNodeDetailsDialogProps) => {
  const intl = useIntl();
  const { theme } = useThemeStore();

  return (
    <Dialog onOpenChange={(open) => !open && onClose()} open={node != null}>
      <DialogContent className="max-h-[85vh] grid-rows-[auto_minmax(0,1fr)_auto_auto_auto] sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{intl.formatMessage({ id: 'graph.node-details-dialog.title' })}</DialogTitle>
        </DialogHeader>
        {node != null && (
          <section className="flex min-h-0 flex-col gap-2">
            <h3 className="text-sm font-semibold">{intl.formatMessage({ id: 'graph.node-details-dialog.content' })}</h3>
            <div className="min-h-0 overflow-auto rounded-md border bg-muted/30 p-3">
              <JsonEditor
                enableClipboard
                viewOnly
                collapse={false}
                data={node.data.origin}
                maxWidth="100%"
                minWidth="100%"
                rootName={node.data.label}
                theme={theme === 'dark' ? githubDarkTheme : githubLightTheme}
              />
            </div>
          </section>
        )}
        {node != null && (
          <section className="space-y-2">
            <h3 className="text-sm font-semibold">
              {intl.formatMessage({ id: 'graph.node-details-dialog.json-path' })}
            </h3>
            <div className="flex items-center rounded-md border bg-muted">
              <code className="min-w-0 flex-1 overflow-x-auto whitespace-nowrap px-4 py-3 text-sm">{node.id}</code>
              {/* eslint-disable-next-line @typescript-eslint/no-use-before-define */}
              <PathCopyButton
                label={intl.formatMessage({ id: 'graph.node-details-dialog.action-copy-json-path' })}
                message={intl.formatMessage({ id: 'graph.node-details-dialog.copied' })}
                path={node.id}
              />
            </div>
          </section>
        )}
        {node != null && (
          <section className="space-y-2">
            <h3 className="text-sm font-semibold">{intl.formatMessage({ id: 'graph.node-details-dialog.jq-path' })}</h3>
            <div className="flex items-center rounded-md border bg-muted">
              <code className="min-w-0 flex-1 overflow-x-auto whitespace-nowrap px-4 py-3 text-sm">
                {jsonPathToJqPath(node.id)}
              </code>
              {/* eslint-disable-next-line @typescript-eslint/no-use-before-define */}
              <PathCopyButton
                label={intl.formatMessage({ id: 'graph.node-details-dialog.action-copy-jq-path' })}
                message={intl.formatMessage({ id: 'graph.node-details-dialog.copied' })}
                path={jsonPathToJqPath(node.id)}
              />
            </div>
          </section>
        )}
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">{intl.formatMessage({ id: 'graph.node-details-dialog.action-close' })}</Button>
          </DialogClose>
          <Button disabled={node == null} onClick={() => node != null && onFindInEditor(node)}>
            {intl.formatMessage({ id: 'graph.node-details-dialog.action-find-in-editor' })}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

interface IPathCopyButtonProps {
  label: string;
  message: string;
  path: string;
}

const PathCopyButton = ({ label, message, path }: IPathCopyButtonProps) => {
  const [open, setOpen] = useState(false);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(
    () => () => {
      clearTimeout(closeTimerRef.current);
    },
    [],
  );

  const copy = useCallback(() => {
    navigator.clipboard
      .writeText(path)
      .then(() => {
        clearTimeout(closeTimerRef.current);
        setOpen(true);
        closeTimerRef.current = setTimeout(() => setOpen(false), 1_500);
      })
      .catch(() => setOpen(false));
  }, [path]);

  return (
    <Popover onOpenChange={(nextOpen) => !nextOpen && setOpen(false)} open={open}>
      <PopoverTrigger asChild>
        <Button aria-label={label} className="mr-1 shrink-0" onClick={copy} size="icon" type="button" variant="ghost">
          <Copy />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="center" className="w-auto px-3 py-2 text-sm font-medium" side="top">
        {message}
      </PopoverContent>
    </Popover>
  );
};

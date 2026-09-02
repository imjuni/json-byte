import { githubDarkTheme, githubLightTheme, JsonEditor } from 'json-edit-react';
import { useIntl } from 'react-intl';

import { Button } from '#/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '#/components/ui/dialog';
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
            <code className="block overflow-x-auto rounded-md border bg-muted px-4 py-3 text-sm">{node.id}</code>
          </section>
        )}
        {node != null && (
          <section className="space-y-2">
            <h3 className="text-sm font-semibold">{intl.formatMessage({ id: 'graph.node-details-dialog.jq-path' })}</h3>
            <code className="block overflow-x-auto rounded-md border bg-muted px-4 py-3 text-sm">
              {jsonPathToJqPath(node.id)}
            </code>
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

import { useEffect, useRef, useState } from 'react';

import Clipboard from 'clipboard';
import { Link as IconLink } from 'lucide-react';
import { useIntl } from 'react-intl';

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
import { Label } from '#/components/ui/label';
import { Textarea } from '#/components/ui/textarea';
import { CE_EDITOR_URL } from '#/contracts/editors/CE_EDITOR_URL';
import { encode } from '#/lib/messagepack/encode';
import { toBase64 } from '#/lib/messagepack/toBase64';
import { useEditorStore } from '#/stores/editorStore';

export const ExportDialog = () => {
  const intl = useIntl();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const copyButtonRef = useRef<HTMLButtonElement>(null);
  const [querystring, setQuerystring] = useState<string>();
  const { content } = useEditorStore();

  const handleOpenChange = (open: boolean) => {
    if (open) {
      // Wait for dialog animation and rendering
      setTimeout(() => {
        textareaRef.current?.select();
      }, 100);
    }
  };

  useEffect(() => {
    const encoded = encode(content);

    if (encoded instanceof Error) {
      return;
    }

    const base64ed = toBase64(encoded);
    setQuerystring(base64ed);
  }, [content, setQuerystring]);

  useEffect(() => {
    if (copyButtonRef.current) {
      const clipboard = new Clipboard(copyButtonRef.current, {
        text: () => `${window.location.origin}${window.location.pathname}?${CE_EDITOR_URL.CONTENT}=${querystring}`,
      });

      return () => {
        clipboard.destroy();
      };
    }

    return undefined;
  }, [querystring]);

  return (
    <Dialog onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button ref={copyButtonRef} size="sm" variant="outline">
          <IconLink /> {intl.$t({ id: 'graph.export-dialog.trigger' })}
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{intl.$t({ id: 'graph.export-dialog.title' })}</DialogTitle>
          <DialogDescription>{intl.$t({ id: 'graph.export-dialog.description' })}</DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-2">
          <div className="grid flex-1 gap-2">
            <Label className="sr-only" htmlFor="link">
              {intl.$t({ id: 'graph.export-dialog.sr-textarea-label' })}
            </Label>

            <Textarea
              ref={textareaRef}
              readOnly
              className="min-h-[120px] max-h-[120px] resize-none"
              id="link"
              rows={5}
              value={`${window.location.origin}${window.location.pathname}?${CE_EDITOR_URL.CONTENT}=${querystring}`}
            />
          </div>
        </div>

        <DialogFooter className="sm:justify-start">
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              {intl.$t({ id: 'graph.export-dialog.action-close' })}
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

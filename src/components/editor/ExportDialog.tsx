import { useEffect, useRef } from 'react';

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

export const ExportDialog = () => {
  const intl = useIntl();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const copyButtonRef = useRef<HTMLButtonElement>(null);

  const handleOpenChange = (open: boolean) => {
    if (open) {
      // Wait for dialog animation and rendering
      setTimeout(() => {
        textareaRef.current?.select();
      }, 100);
    }
  };

  useEffect(() => {
    if (copyButtonRef.current) {
      const clipboard = new Clipboard(copyButtonRef.current, {
        text: () => window.location.href,
      });

      return () => {
        clipboard.destroy();
      };
    }

    return undefined;
  }, []);

  return (
    <Dialog onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button ref={copyButtonRef} size="sm" variant="outline">
          <IconLink />
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
              value={window.location.href}
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

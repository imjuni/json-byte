import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { Upload } from 'lucide-react';
import { useIntl } from 'react-intl';
import { Subject } from 'rxjs';
import { debounceTime, switchMap, tap } from 'rxjs/operators';

import { Button } from '#/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '#/components/ui/card';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '#/components/ui/dialog';
import { Input } from '#/components/ui/input';
import { Label } from '#/components/ui/label';
import { Spinner } from '#/components/ui/spinner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '#/components/ui/tabs';
import { useXyFlowBuilder } from '#/hooks/useXyFlowBuilder';
import { useEditorStore } from '#/stores/editorStore';
import { useImportStore } from '#/stores/importStore';

export const ImportDialog = () => {
  const intl = useIntl();
  const { setContent } = useEditorStore();
  const { updateFromContent } = useXyFlowBuilder();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { file, open, error, isUploading, setError, setFile, setOpen, reset, setIsUploading } = useImportStore();
  const fileSelect$ = useMemo(() => new Subject<void>(), []);
  const upload$ = useMemo(() => new Subject<void>(), []);
  const [buttonTitle, setButtonTitle] = useState<string>(intl.$t({ id: 'graph.import-dialog.file-upload' }));

  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = event.target.files?.[0];
      if (selectedFile != null) {
        setFile(selectedFile);
        setError(undefined);
      }
    },
    [setFile, setError],
  );

  const handleBrowseClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleOpenChange = useCallback(
    (isOpen: boolean) => {
      setOpen(isOpen);

      if (!isOpen) {
        reset();
        setButtonTitle(intl.$t({ id: 'graph.import-dialog.file-upload' }));
      }
    },
    [intl, setOpen, setButtonTitle, reset],
  );

  const handleFileUpload = useCallback(async () => {
    if (file == null) {
      setButtonTitle(intl.$t({ id: 'graph.import-dialog.file-upload' }));
      setError(new Error('Please select a file'));
      return;
    }

    try {
      setButtonTitle(intl.$t({ id: 'graph.import-dialog.file-uploading' }));
      setIsUploading('uploading');

      const text = await file.text();

      // Try to parse as JSON to validate
      const parsed = JSON.parse(text);

      // If successful, update editor content and visualization
      const formattedJson = JSON.stringify(parsed, null, 2);

      setContent(formattedJson);
      updateFromContent(formattedJson);

      // Close dialog and reset state
      reset();

      setButtonTitle(intl.$t({ id: 'graph.import-dialog.file-uploaded' }));
      setIsUploading('upload-complete');

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      setTimeout(() => {
        handleOpenChange(false);
      }, 100);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Invalid JSON file'));
    }
  }, [file, intl, reset, setError, setContent, setButtonTitle, setIsUploading, handleOpenChange, updateFromContent]);

  useEffect(() => {
    const subscription = fileSelect$
      .pipe(
        debounceTime(500),
        tap(() => handleBrowseClick()),
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [fileSelect$, handleBrowseClick]);

  useEffect(() => {
    const subscription = upload$
      .pipe(
        debounceTime(500),
        switchMap(async () => {
          await handleFileUpload();
        }),
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [upload$, handleFileUpload, setError]);

  return (
    <Dialog onOpenChange={handleOpenChange} open={open}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Upload /> {intl.$t({ id: 'graph.import-dialog.trigger' })}
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{intl.$t({ id: 'graph.import-dialog.title' })}</DialogTitle>
        </DialogHeader>

        <div className="flex w-full max-w-sm flex-col gap-6">
          <Tabs defaultValue="file-upload">
            <TabsList>
              <TabsTrigger value="file-upload">
                {intl.$t({ id: 'graph.import-dialog.upload-card-tab-title' })}
              </TabsTrigger>
              <TabsTrigger value="url">{intl.$t({ id: 'graph.import-dialog.upload-card-tab-api' })}</TabsTrigger>
            </TabsList>

            <TabsContent value="file-upload">
              <Card>
                <CardHeader>
                  <CardTitle>{intl.$t({ id: 'graph.import-dialog.upload-card-title' })}</CardTitle>
                  <CardDescription>{intl.$t({ id: 'graph.import-dialog.upload-card-description' })}</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6">
                  <div className="grid gap-3">
                    <Label htmlFor="file-upload">
                      {intl.$t({ id: 'graph.import-dialog.upload-card-input-label' })}
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        ref={fileInputRef}
                        accept=".json,application/json"
                        className="hidden"
                        id="file-upload"
                        onChange={handleFileChange}
                        type="file"
                      />
                      <Input
                        readOnly
                        className="flex-1"
                        placeholder={intl.$t({ id: 'graph.import-dialog.upload-card-input-placeholder' })}
                        value={file?.name ?? ''}
                        onClick={() => {
                          fileSelect$.next();
                        }}
                      />
                    </div>
                  </div>
                  {error != null && <div className="text-sm text-red-500">{error.message}</div>}
                </CardContent>
                <CardFooter>
                  <Button disabled={file == null || isUploading === 'uploading'} onClick={handleFileUpload}>
                    {isUploading === 'uploading' && <Spinner />}
                    {buttonTitle}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="url">
              <Card>
                <CardHeader>
                  <CardTitle>Import from URL</CardTitle>
                  <CardDescription>Enter a URL to fetch JSON data from a remote source.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6">
                  <div className="grid gap-3">
                    <Label htmlFor="url-input">URL</Label>
                    <Input id="url-input" placeholder="https://example.com/data.json" />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button disabled>Fetch (Coming Soon)</Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter className="sm:justify-start">
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              {intl.$t({ id: 'graph.import-dialog.action-close' })}
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

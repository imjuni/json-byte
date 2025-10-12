import { useCallback, useEffect, useMemo, useRef } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import { Upload } from 'lucide-react';
import { isError } from 'my-easy-fp';
import { Controller, useForm } from 'react-hook-form';
import { useIntl } from 'react-intl';
import { Subject } from 'rxjs';
import { debounceTime, switchMap, tap } from 'rxjs/operators';
import { z } from 'zod';

import { FetchImportBodyJsonContent } from '#/components/editor/features/FetchImportBodyJsonContent';
import { FetchImportHeaderAppendable } from '#/components/editor/features/FetchImportHeaderAppendable';
import { FetchImportMethodDropdown } from '#/components/editor/features/FetchImportMethodDropdown';
import { useEditorConfiger } from '#/components/editor/hooks/useEditorConfiger';
import { useImportProgressHookBuilder } from '#/components/editor/hooks/useImportProgressHookBuilder';
import { useXyFlowBuilder } from '#/components/editor/hooks/useXyFlowBuilder';
import { apiFetchFormSchema } from '#/components/editor/schemas/apiFetchFormSchema';
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
import { Field, FieldError, FieldLabel } from '#/components/ui/field';
import { Input } from '#/components/ui/input';
import { Label } from '#/components/ui/label';
import { Spinner } from '#/components/ui/spinner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '#/components/ui/tabs';
import { multiParse } from '#/lib/json/multiParse';
import { multiStringify } from '#/lib/json/multiStringify';
import { useEditorStore } from '#/stores/editorStore';
import { useImportStore } from '#/stores/importStore';
import { useNotificationStore } from '#/stores/notificationStore';

import type { TApiFetchFormSchema } from '#/components/editor/schemas/apiFetchFormSchema';

const filenameSchema = z.string().default('');

export const ImportDialog = () => {
  const intl = useIntl();
  const fileSelect$ = useMemo(() => new Subject<void>(), []);
  const upload$ = useMemo(() => new Subject<void>(), []);
  const fetch$ = useMemo(() => new Subject<TApiFetchFormSchema>(), []);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { language, setLanguage, setContent } = useEditorStore();
  const { setNotification } = useNotificationStore();
  const { handleChangeEditorLanguage } = useEditorConfiger();
  const { updateFromContent } = useXyFlowBuilder();
  const { file, open, error, isUploading, isFetching, setError, setFile, setOpen, reset } = useImportStore();
  const apiFetchForm = useForm<TApiFetchFormSchema>({
    mode: 'onChange',
    resolver: zodResolver(apiFetchFormSchema),
    defaultValues: {
      url: '',
      method: 'get',
    },
  });

  const { fileUploadButtonTitle, apiFetchButtonTitle, hanldeJsonParse, handleUploadProgress, handleFetchProgress } =
    useImportProgressHookBuilder();

  const hanldeDialogReset = useCallback(() => {
    handleUploadProgress('non-dirty');
    handleFetchProgress('non-dirty');
    reset();
    apiFetchForm.reset();
  }, [handleUploadProgress, handleFetchProgress, apiFetchForm, reset]);

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
        hanldeDialogReset();
      }
    },
    [setOpen, hanldeDialogReset],
  );

  const handleFileUpload = useCallback(async () => {
    if (file == null) {
      handleUploadProgress('upload-fail');
      setError(new Error('Please select a file'));
      return;
    }

    try {
      handleUploadProgress('uploading');

      const text = await file.text();

      // Try to parse as JSON to validate
      const parsed = multiParse(text);

      if (parsed instanceof Error) {
        setError(parsed);

        setNotification({
          open: true,
          kind: 'danger',
          autoClose: 5000,
          title: intl.$t({ id: 'graph.import-dialog.file-error.title' }),
          description: intl.$t({ id: 'graph.import-dialog.file-error.fail-parse' }),
        });

        setTimeout(() => {
          handleOpenChange(false);
        }, 100);
        return;
      }

      // If successful, update editor content and visualization
      const formattedJson = multiStringify(parsed.data, parsed.language, undefined, 2);

      if (formattedJson instanceof Error) {
        setError(formattedJson);

        setNotification({
          open: true,
          kind: 'danger',
          autoClose: 5000,
          title: intl.$t({ id: 'graph.import-dialog.file-error.title' }),
          description: intl.$t(
            { id: 'graph.import-dialog.file-error.fail-format' },
            { message: `: ${formattedJson.message}` },
          ),
        });

        setTimeout(() => {
          handleOpenChange(false);
        }, 100);
        return;
      }

      if (language !== parsed.language) {
        setLanguage(parsed.language);
        handleChangeEditorLanguage(parsed.language);
      }

      setContent(formattedJson);
      updateFromContent(formattedJson);

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      setTimeout(() => {
        handleOpenChange(false);
      }, 100);
    } catch (caught) {
      const err = isError(caught, new Error('Invalid JSON file'));
      setError(err);

      setNotification({
        open: true,
        kind: 'danger',
        autoClose: 5000,
        title: intl.$t({ id: 'graph.import-dialog.file-error.title' }),
        description: intl.$t({ id: 'graph.import-dialog.file-error.raise-error' }, { message: `: ${err.message}` }),
      });
    }
  }, [
    file,
    intl,
    language,
    handleUploadProgress,
    handleChangeEditorLanguage,
    setError,
    setContent,
    setLanguage,
    setNotification,
    handleOpenChange,
    updateFromContent,
  ]);

  const handleAPIFetch = useCallback(
    async (data: TApiFetchFormSchema) => {
      handleFetchProgress('fetching');

      // Convert headers array to axios headers object
      const headersObject = data.headers?.reduce<Record<string, string>>((aggregated, header) => {
        if (header.key.trim() !== '') {
          return { ...aggregated, [header.key]: header.value };
        }

        return aggregated;
      }, {});

      // Parse body if provided
      const parsedBody = hanldeJsonParse(data.body);

      try {
        const reply = await axios.request({
          method: data.method,
          url: data.url,
          headers: headersObject,
          data: parsedBody,
          validateStatus: () => true,
        });

        if (reply.status < 300 && reply.data != null) {
          const formattedJson = JSON.stringify(reply.data, null, 2);

          setContent(formattedJson);
          updateFromContent(formattedJson);

          handleFetchProgress('fetch-complete');
        } else {
          setNotification({
            open: true,
            kind: 'danger',
            autoClose: 5000,
            title: intl.$t({ id: 'graph.import-dialog.api-fetch-error.title' }),
            description: intl.$t({ id: 'graph.import-dialog.api-fetch-error.fetch-fail' }),
          });

          handleFetchProgress('fetch-fail');
        }
      } catch (caught) {
        const err = isError(caught, new Error('unknown error raised from API fetching'));

        setNotification({
          open: true,
          kind: 'danger',
          autoClose: 5000,
          title: intl.$t({ id: 'graph.import-dialog.api-fetch-error.title' }),
          description: intl.$t(
            { id: 'graph.import-dialog.api-fetch-error.raise-error' },
            { message: `: ${err.message}` },
          ),
        });

        handleFetchProgress('fetch-fail');
      }

      setTimeout(() => {
        handleOpenChange(false);
      }, 100);
    },
    [intl, setContent, setNotification, hanldeJsonParse, handleFetchProgress, updateFromContent, handleOpenChange],
  );

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
        tap(() => handleUploadProgress('uploading')),
        debounceTime(500),
        switchMap(async () => {
          await handleFileUpload();
        }),
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [upload$, handleFileUpload, handleUploadProgress]);

  useEffect(() => {
    const subscription = fetch$
      .pipe(
        tap(() => handleFetchProgress('fetching')),
        debounceTime(500),
        switchMap(async (data) => {
          await handleAPIFetch(data);
        }),
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [fetch$, handleAPIFetch, handleFetchProgress]);

  useEffect(() => () => apiFetchForm.reset(), [apiFetchForm]);

  return (
    <Dialog onOpenChange={handleOpenChange} open={open}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Upload /> {intl.$t({ id: 'graph.import-dialog.trigger' })}
        </Button>
      </DialogTrigger>

      <DialogContent aria-describedby="" className="lg:max-w-lg">
        <DialogHeader>
          <DialogTitle>{intl.$t({ id: 'graph.import-dialog.title' })}</DialogTitle>
        </DialogHeader>

        <div className="flex w-full max-w-lg flex-col gap-6">
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
                        accept=".json,.yml,.yaml,application/json"
                        className="hidden"
                        id="file-upload"
                        onChange={handleFileChange}
                        type="file"
                      />
                      <Input
                        readOnly
                        className="flex-1"
                        placeholder={intl.$t({ id: 'graph.import-dialog.upload-card-input-placeholder' })}
                        value={filenameSchema.parse(file?.name)}
                        onClick={() => {
                          fileSelect$.next();
                        }}
                      />
                    </div>
                  </div>
                  {error != null && <div className="text-sm text-red-500">{error.message}</div>}
                </CardContent>
                <CardFooter>
                  <Button disabled={file == null || isUploading === 'uploading'} onClick={() => upload$.next()}>
                    {isUploading === 'uploading' && <Spinner />}
                    {fileUploadButtonTitle}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="url">
              <Card>
                <CardHeader>
                  <CardTitle>{intl.$t({ id: 'graph.import-dialog.api-fetch-card-title' })}</CardTitle>
                  <CardDescription>{intl.$t({ id: 'graph.import-dialog.api-fetch-card-description' })}</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6">
                  <form>
                    <div className="grid gap-3">
                      <Controller
                        control={apiFetchForm.control}
                        name="url"
                        render={({ field, fieldState }) => (
                          <Field data-invalid={fieldState.invalid}>
                            <FieldLabel htmlFor="url-input">URL</FieldLabel>
                            <div className="flex flex-row gap-2">
                              <FetchImportMethodDropdown form={apiFetchForm} />

                              <Input
                                {...field}
                                id="url-input"
                                placeholder="https://petstore3.swagger.io/api/v3/openapi.json"
                              />
                            </div>
                            {fieldState.invalid && fieldState.error?.message ? (
                              <FieldError errors={[{ message: intl.$t({ id: fieldState.error.message }) }]} />
                            ) : null}
                          </Field>
                        )}
                      />

                      <FetchImportHeaderAppendable form={apiFetchForm} />

                      <FetchImportBodyJsonContent form={apiFetchForm} />
                    </div>
                  </form>
                </CardContent>
                <CardFooter>
                  <Button
                    disabled={!apiFetchForm.formState.isValid || isFetching === 'fetching'}
                    onClick={apiFetchForm.handleSubmit((data) => fetch$.next(data))}
                    type="submit"
                  >
                    {isFetching === 'fetching' && <Spinner />}
                    {apiFetchButtonTitle}
                  </Button>
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

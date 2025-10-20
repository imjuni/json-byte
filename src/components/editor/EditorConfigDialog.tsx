import { useCallback, useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { Settings } from 'lucide-react';
import { nanoid } from 'nanoid';
import { Controller, useForm } from 'react-hook-form';
import { useIntl } from 'react-intl';

import { useEditorConfiger } from '#/components/editor/hooks/useEditorConfiger';
import { useGraphBuilder } from '#/components/editor/hooks/useGraphBuilder';
import { useLanguageConvertor } from '#/components/editor/hooks/useLanguageConvertor';
import { editorConfigFormSchema, indents, languages, themes } from '#/components/editor/schemas/editorConfigFormSchema';
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
import { Field, FieldLabel } from '#/components/ui/field';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '#/components/ui/select';
import { useEditorStore } from '#/stores/editorStore';

import type { TEditorConfigFormSchema } from '#/components/editor/schemas/editorConfigFormSchema';
import type { TEditorLanguage } from '#/contracts/editors/IEditorStore';

export const EditorConfigDialog = () => {
  const intl = useIntl();
  const [open, setOpen] = useState<boolean>(false);
  const { convertToYaml, convertToJson, convertIndent } = useLanguageConvertor();
  const { handleChangeEditorLanguage } = useEditorConfiger();
  const { updateFromContent } = useGraphBuilder();
  const { content, language, indent, theme, setEditorConfig, setContent, editorInstance, monacoInstance } =
    useEditorStore();

  const editorConfigForm = useForm<TEditorConfigFormSchema>({
    mode: 'onChange',
    resolver: zodResolver(editorConfigFormSchema),
    defaultValues: {
      indent: `${indent}`,
      theme,
      language,
    },
  });

  const onHandleSubmit = useCallback(
    (data: TEditorConfigFormSchema) => {
      const parsedIndent = Number.parseInt(data.indent, 10);

      if (language !== data.language && data.language === 'json') {
        const converted = convertToJson(content, parsedIndent);

        if (converted != null) {
          setContent(converted);
          updateFromContent(converted);
        }
      }

      if (language !== data.language && data.language === 'yaml') {
        const converted = convertToYaml(content, parsedIndent);

        if (converted != null) {
          setContent(converted);
          updateFromContent(converted);
        }
      }

      if (language === data.language && parsedIndent !== indent) {
        const converted = convertIndent(content, data.language as TEditorLanguage, parsedIndent);

        if (converted != null) {
          setContent(converted);
          updateFromContent(converted);
        }
      }

      // Update Monaco Editor language model
      if (editorInstance != null && monacoInstance != null && language !== data.language) {
        handleChangeEditorLanguage(data.language as TEditorLanguage);
      }

      // Update editor indent settings
      if (editorInstance != null && indent !== parsedIndent) {
        editorInstance.updateOptions({
          tabSize: parsedIndent,
          insertSpaces: true,
        });
      }

      setEditorConfig({ indent: parsedIndent, theme: data.theme, language: data.language });

      setTimeout(() => setOpen(false), 50);
    },
    [
      language,
      content,
      indent,
      editorInstance,
      monacoInstance,
      handleChangeEditorLanguage,
      convertToYaml,
      convertToJson,
      convertIndent,
      setContent,
      setEditorConfig,
      updateFromContent,
    ],
  );

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Settings />
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{intl.$t({ id: 'graph.editor-config-dialog.title' })}</DialogTitle>
          <DialogDescription>{intl.$t({ id: 'graph.export-dialog.description' })}</DialogDescription>
        </DialogHeader>

        <div className="flex">
          <form className="w-[100%] gap-y-2" id="editor-config-form">
            <Controller
              control={editorConfigForm.control}
              name="indent"
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel htmlFor="editor-config-indent-select">
                    {intl.$t({ id: 'graph.editor-config-dialog.indent' })}
                  </FieldLabel>

                  <Select name={field.name} onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger
                      aria-invalid={fieldState.invalid}
                      className="w-[100%]"
                      id="editor-config-indent-select"
                    >
                      <SelectValue placeholder="indent" />
                    </SelectTrigger>

                    <SelectContent>
                      {indents.map((indentItem) => (
                        <SelectItem key={nanoid()} value={indentItem.value}>
                          {indentItem.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              )}
            />

            <div className="h-4" />

            <Controller
              control={editorConfigForm.control}
              name="language"
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel htmlFor="editor-config-language-select">
                    {intl.$t({ id: 'graph.editor-config-dialog.language' })}
                  </FieldLabel>

                  <Select name={field.name} onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger
                      aria-invalid={fieldState.invalid}
                      className="w-[100%]"
                      id="editor-config-language-select"
                    >
                      <SelectValue placeholder="language" />
                    </SelectTrigger>

                    <SelectContent>
                      {languages.map((languageItem) => (
                        <SelectItem key={nanoid()} value={languageItem.value}>
                          {languageItem.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              )}
            />

            <div className="h-4" />

            <Controller
              control={editorConfigForm.control}
              name="theme"
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel htmlFor="editor-config-theme-select">
                    {intl.$t({ id: 'graph.editor-config-dialog.theme' })}
                  </FieldLabel>

                  <Select name={field.name} onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger
                      aria-invalid={fieldState.invalid}
                      className="w-[100%]"
                      id="editor-config-theme-select"
                    >
                      <SelectValue placeholder="theme" />
                    </SelectTrigger>

                    <SelectContent>
                      {themes.map((themeItem) => (
                        <SelectItem key={nanoid()} value={themeItem.value}>
                          {themeItem.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              )}
            />
          </form>
        </div>

        <DialogFooter className="sm:justify-start gap-2">
          <Button onClick={editorConfigForm.handleSubmit(onHandleSubmit)} type="button" variant="secondary">
            {intl.$t({ id: 'graph.editor-config-dialog.action-submit' })}
          </Button>

          <DialogClose asChild>
            <Button type="button" variant="secondary">
              {intl.$t({ id: 'graph.editor-config-dialog.action-close' })}
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

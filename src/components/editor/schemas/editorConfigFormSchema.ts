import { z } from 'zod';

export const indents = [
  { label: '2', value: '2' },
  { label: '3', value: '3' },
  { label: '4', value: '4' },
  { label: '6', value: '6' },
  { label: '8', value: '8' },
];

export const themes = [
  { label: 'Visual Studio', value: 'vs' },
  { label: 'Visual Studio Dark', value: 'vs-dark' },
  { label: 'High Contrast black', value: 'hc-black' },
];

export const languages = [
  { label: 'JSON', value: 'json' },
  // JSON with comment 규격은 주석을 유지하는 것이 쉽지 않아 현 시점에서 parse 만 지원한다
  // { label: 'JSON With Comment', value: 'jsonc' },
  { label: 'YAML', value: 'yaml' },
];

export const editorConfigFormSchema = z.object({
  indent: z.enum(indents.map((indent) => indent.value)),
  theme: z.enum(themes.map((theme) => theme.value)),
  language: z.enum(languages.map((language) => language.value)),
});

export type TEditorConfigFormSchema = z.infer<typeof editorConfigFormSchema>;

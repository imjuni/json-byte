import type { Monaco } from '@monaco-editor/react';
import type { editor } from 'monaco-editor';

import type { TEditorConfigFormSchema } from '#/components/editor/schemas/editorConfigFormSchema';

export type TEditorLanguage = 'json' | 'yaml';

export interface IEditorStoreState {
  // State
  content: string;
  indent: number;
  language: TEditorConfigFormSchema['language'];
  editorInstance?: editor.IStandaloneCodeEditor;
  monacoInstance?: Monaco;
}

export interface IEditorStoreAction {
  // Actions
  setContent: (content: string) => void;
  setLanguage: (language: TEditorConfigFormSchema['language']) => void;
  setIndent: (indent: TEditorConfigFormSchema['indent']) => void;
  setEditorInstance: (instance?: editor.IStandaloneCodeEditor) => void;
  setMonacoInstance: (instance?: Monaco) => void;
  setEditorConfig: (config: Pick<IEditorStoreState, 'indent' | 'language'>) => void;
  reset: () => void;
}

export type TEditorStore = IEditorStoreState & IEditorStoreAction;

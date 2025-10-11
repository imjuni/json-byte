import type { editor } from 'monaco-editor';

import type { TEditorLanguage } from '#/contracts/editors/editor';

export interface IEditorStore {
  // State
  content: string;
  language: TEditorLanguage;
  editorInstance?: editor.IStandaloneCodeEditor;

  // Actions
  setContent: (content: string) => void;
  setLanguage: (language: TEditorLanguage) => void;
  setEditorInstance: (instance?: editor.IStandaloneCodeEditor) => void;
  reset: () => void;
}

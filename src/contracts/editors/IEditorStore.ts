import type { JsonValue } from 'type-fest';

import type { TEditorLanguage } from '#/contracts/editors/editor';

export interface IEditorStore {
  // State
  content: string;
  language: TEditorLanguage;
  document: JsonValue | Error;

  // Actions
  setContent: (content: string) => void;
  setLanguage: (language: TEditorLanguage) => void;
  setDocument: (value: JsonValue | Error) => void;
  reset: () => void;
}

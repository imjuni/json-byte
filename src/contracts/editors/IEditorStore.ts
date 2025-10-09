import type { TEditorLanguage } from '#/contracts/editors/editor';

export interface IEditorStore {
  // State
  content: string;
  language: TEditorLanguage;

  // Actions
  setContent: (content: string) => void;
  setLanguage: (language: TEditorLanguage) => void;
  reset: () => void;
}

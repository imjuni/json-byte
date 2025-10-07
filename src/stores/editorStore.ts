import { create } from 'zustand';

import type { JsonValue } from 'type-fest';

import type { TEditorLanguage } from '#/contracts/editors/editor';
import type { IEditorStore } from '#/contracts/editors/IEditorStore';

export const useEditorStore = create<IEditorStore>((set) => ({
  // Initial state
  content: JSON.stringify({ name: 'ironman' }, undefined, 2),
  language: 'json',
  document: {},

  // Actions
  setContent: (content: string) => {
    set({ content });
  },

  setDocument: (document: JsonValue | Error) => {
    set({ document });
  },

  setLanguage: (language: TEditorLanguage) => {
    set({ language });
  },

  reset: () => {
    set({ content: '{}', language: 'json' });
  },
}));

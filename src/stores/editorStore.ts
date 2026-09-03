import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { TEditorStore } from '#/contracts/editors/IEditorStore';

const example = {
  firstName: 'John',
  lastName: 'doe',
  age: 26,
  work: true,
  address: {
    streetAddress: 'naist street',
    city: 'Nara',
    postalCode: '630-0192',
  },
  phoneNumbers: [
    {
      type: 'iPhone',
      number: '0123-4567-8888',
    },
    {
      type: 'home',
      number: '0123-4567-8910',
    },
  ],
};

export const useEditorStore = create<TEditorStore>()(
  persist(
    (set) => ({
      // Initial state
      content: JSON.stringify(example, undefined, 2),
      language: 'json',
      indent: 2,
      editorInstance: undefined,
      monacoInstance: undefined,

      // Actions
      setContent: (content: string) => set({ content }),
      setLanguage: (language) => set({ language }),
      setIndent: (indent) => set({ indent: Number.parseInt(indent, 10) }),
      setEditorInstance: (instance) => set({ editorInstance: instance }),
      setMonacoInstance: (instance) => set({ monacoInstance: instance }),
      setEditorConfig: (config) => set({ language: config.language, indent: config.indent }),
      reset: () => set({ content: '{}', language: 'json', indent: 2 }),
    }),
    {
      name: 'json-byte-editor',
      storage: createJSONStorage(() => localStorage),
      // Exclude editorInstance from persistence (it's not serializable)
      partialize: (state) => ({
        content: state.content,
        language: state.language,
        indent: state.indent,
      }),
    },
  ),
);

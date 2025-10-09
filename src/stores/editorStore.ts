import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { TEditorLanguage } from '#/contracts/editors/editor';
import type { IEditorStore } from '#/contracts/editors/IEditorStore';

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

export const useEditorStore = create<IEditorStore>()(
  persist(
    (set) => ({
      // Initial state
      content: JSON.stringify(example, undefined, 2),
      language: 'json',

      // Actions
      setContent: (content: string) => {
        set({ content });
      },

      setLanguage: (language: TEditorLanguage) => {
        set({ language });
      },

      reset: () => {
        set({ content: '{}', language: 'json' });
      },
    }),
    {
      name: 'json-byte-editor',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

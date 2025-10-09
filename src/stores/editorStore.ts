import { create } from 'zustand';

import type { JsonValue } from 'type-fest';

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

export const useEditorStore = create<IEditorStore>((set) => ({
  // Initial state
  content: JSON.stringify(example, undefined, 2),
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

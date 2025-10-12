import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { CE_EDITOR_URL } from '#/contracts/editors/CE_EDITOR_URL';
import { safeParse } from '#/lib/json/safeParse';
import { decode } from '#/lib/messagepack/decode';
import { fromBase64 } from '#/lib/messagepack/fromBase64';

import type { JsonValue } from 'type-fest';

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

/**
 * Load content from querystring 'q' parameter
 * Priority: querystring > localStorage > default
 */
const loadFromQueryString = (): JsonValue | Error => {
  try {
    const params = new URLSearchParams(window.location.search);
    const contentFromQuerystring = params.get(CE_EDITOR_URL.CONTENT);

    if (contentFromQuerystring == null) {
      return new Error('Cannot found content in Querystring');
    }

    // Decode: base64 -> Uint8Array -> JsonValue
    const base64Decoded = fromBase64(contentFromQuerystring);

    if (base64Decoded instanceof Error) {
      return base64Decoded;
    }

    // Convert JsonValue to string
    const decoded = decode(base64Decoded);

    if (decoded instanceof Error) {
      return decoded;
    }

    const jsonValue = safeParse(decoded as string);

    if (jsonValue instanceof Error) {
      return jsonValue;
    }

    return jsonValue;
  } catch {
    return null;
  }
};

export const useEditorStore = create<TEditorStore>()(
  persist(
    (set) => ({
      // Initial state
      content: JSON.stringify(example, undefined, 2),
      language: 'json',
      indent: 2,
      theme: 'vs',
      editorInstance: undefined,
      monacoInstance: undefined,

      // Actions
      setContent: (content: string) => set({ content }),
      setLanguage: (language) => set({ language }),
      setIndent: (theme) => set({ theme }),
      setTheme: (theme) => set({ theme }),
      setEditorInstance: (instance) => set({ editorInstance: instance }),
      setMonacoInstance: (instance) => set({ monacoInstance: instance }),
      setEditorConfig: (config) => set({ language: config.language, indent: config.indent, theme: config.theme }),
      reset: () => set({ content: '{}', language: 'json', theme: 'vs', indent: 2 }),
    }),
    {
      name: 'json-byte-editor',
      storage: createJSONStorage(() => localStorage),
      // Exclude editorInstance from persistence (it's not serializable)
      partialize: (state) => ({
        content: state.content,
        language: state.language,
        theme: state.theme,
        indent: state.indent,
      }),
      onRehydrateStorage: () => (state) => {
        // Try to load from querystring first
        const loaded = loadFromQueryString();

        if (loaded != null && !(loaded instanceof Error) && state != null) {
          const content = JSON.stringify(loaded, undefined, 2);

          // aviod param reassign, create referance of the state
          const reassign = state;
          reassign.content = content;

          // Save to localStorage for future use
          const updatedState = {
            state: { content, language: state.language },
            version: 0,
          };

          localStorage.setItem('json-byte-editor', JSON.stringify(updatedState));
        }
        // If qContent is null, state already has localStorage value from rehydration
      },
    },
  ),
);

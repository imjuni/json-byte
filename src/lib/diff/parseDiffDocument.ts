import { multiParse } from '#/lib/json/multiParse';
import { multiStringify } from '#/lib/json/multiStringify';

import type { JsonValue } from 'type-fest';

import type { TEditorLanguage } from '#/contracts/editors/IEditorStore';

export interface IParsedDiffDocument {
  data?: JsonValue;
  error?: Error;
  language?: TEditorLanguage;
}

export const parseDiffDocument = (source: string): IParsedDiffDocument => {
  if (source.trim().length === 0) return { error: new Error('Document is empty') };
  const parsed = multiParse(source);
  if (parsed instanceof Error) return { error: parsed };
  return parsed;
};

export const formatDiffDocument = (source: string, indent: number): string | Error => {
  const parsed = parseDiffDocument(source);
  if (parsed.error != null || parsed.data == null || parsed.language == null) {
    return parsed.error ?? new Error('Cannot parse document');
  }
  return multiStringify(parsed.data, parsed.language, undefined, indent);
};

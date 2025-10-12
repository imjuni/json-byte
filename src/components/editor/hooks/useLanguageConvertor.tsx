import { useCallback } from 'react';

import { multiParse } from '#/lib/json/multiParse';
import { multiStringify } from '#/lib/json/multiStringify';
import { safeStringify } from '#/lib/json/safeStringify';
import { safeYamlStringify } from '#/lib/json/safeYamlStringify';

import type { TEditorLanguage } from '#/contracts/editors/IEditorStore';

export function useLanguageConvertor() {
  const convertToYaml = useCallback((value: string, indent: number): string | undefined => {
    const parsed = multiParse(value);

    if (parsed instanceof Error) {
      return undefined;
    }

    const stringified = safeYamlStringify(parsed.data, undefined, indent);

    if (stringified instanceof Error) {
      return undefined;
    }

    return stringified;
  }, []);

  const convertToJson = useCallback((value: string, indent: number): string | undefined => {
    const parsed = multiParse(value);

    if (parsed instanceof Error) {
      return undefined;
    }

    const stringified = safeStringify(parsed.data, undefined, indent);

    if (stringified instanceof Error) {
      return undefined;
    }

    return stringified;
  }, []);

  const convertIndent = useCallback((value: string, language: TEditorLanguage, indent: number): string | undefined => {
    const parsed = multiParse(value);

    if (parsed instanceof Error) {
      return undefined;
    }

    const stringified = multiStringify(parsed.data, language, undefined, indent);

    if (stringified instanceof Error) {
      return undefined;
    }

    return stringified;
  }, []);

  return {
    convertToYaml,
    convertToJson,
    convertIndent,
  };
}

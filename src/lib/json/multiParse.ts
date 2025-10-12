import { safeJsoncParse } from '#/lib/json/safeJsoncParse';
import { safeParse } from '#/lib/json/safeParse';
import { safeYamlParse } from '#/lib/json/safeYamlParse';

import type { JsonValue } from 'type-fest';

import type { TEditorLanguage } from '#/contracts/editors/IEditorStore';

export function multiParse(value?: string | null): { language: TEditorLanguage; data: JsonValue } | Error {
  const jsonParsed = safeParse(value);

  if (!(jsonParsed instanceof Error)) {
    return { language: 'json', data: jsonParsed };
  }

  const jsoncParsed = safeJsoncParse(value);

  if (!(jsoncParsed instanceof Error)) {
    return { language: 'json', data: jsoncParsed };
  }

  const yamlParsed = safeYamlParse(value);

  if (!(yamlParsed instanceof Error)) {
    return { language: 'yaml', data: yamlParsed };
  }

  return new Error(`invalid value: ${value}`);
}

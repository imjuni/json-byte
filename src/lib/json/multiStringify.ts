import { stringify } from 'yaml';

import { safeStringify } from '#/lib/json/safeStringify';
import { safeYamlStringify } from '#/lib/json/safeYamlStringify';

import type { JsonValue } from 'type-fest';

import type { TEditorLanguage } from '#/contracts/editors/IEditorStore';

export function multiStringify(
  data: JsonValue,
  language?: TEditorLanguage,
  replacer?: Parameters<typeof JSON.stringify>[1],
  space?: Parameters<typeof JSON.stringify>[2],
): string | Error {
  if (language != null && language === 'json') {
    return JSON.stringify(data, replacer, space);
  }

  if (language != null && language === 'yaml') {
    return stringify(data, replacer, space);
  }

  const jsonStringified = safeStringify(data, replacer, space);

  if (!(jsonStringified instanceof Error)) {
    return jsonStringified;
  }

  const yamlStringified = safeYamlStringify(data, replacer, space);

  if (!(yamlStringified instanceof Error)) {
    return yamlStringified;
  }

  return new Error(`invalid document: ${data}`);
}

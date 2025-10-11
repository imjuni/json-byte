import { safeParse } from '#/lib/json/safeParse';
import { safeYamlParse } from '#/lib/json/safeYamlParse';

import type { JsonValue } from 'type-fest';

export function multiParse(value?: string | null): { kind: 'yaml' | 'json'; data: JsonValue } | Error {
  const jsonParsed = safeParse(value);

  if (!(jsonParsed instanceof Error)) {
    return { kind: 'json', data: jsonParsed };
  }

  const yamlParsed = safeYamlParse(value);

  if (!(yamlParsed instanceof Error)) {
    return { kind: 'yaml', data: yamlParsed };
  }

  return new Error(`invalid value: ${value}`);
}

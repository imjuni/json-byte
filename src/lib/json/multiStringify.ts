import { stringify } from 'yaml';

import { safeStringify } from '#/lib/json/safeStringify';
import { safeYamlStringify } from '#/lib/json/safeYamlStringify';

import type { JsonValue } from 'type-fest';

export function multiStringify(
  data: JsonValue,
  kind?: 'yaml' | 'json',
  replacer?: Parameters<typeof JSON.stringify>[1],
  space?: Parameters<typeof JSON.stringify>[2],
): string | Error {
  if (kind != null && kind === 'json') {
    return JSON.stringify(data, replacer, space);
  }

  if (kind != null && kind === 'yaml') {
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

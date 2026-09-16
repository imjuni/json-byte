import { parseJsonPath } from '#/lib/graph/graphPathIndex';

import type { JsonValue } from 'type-fest';

const replaceValue = (
  current: JsonValue,
  segments: readonly (string | number)[],
  replacement: JsonValue,
): JsonValue => {
  const [segment, ...remaining] = segments;
  if (segment == null) return replacement;

  if (typeof segment === 'number') {
    if (!Array.isArray(current) || segment < 0 || segment >= current.length) return current;
    const next = [...current];
    next[segment] = replaceValue(next[segment] ?? null, remaining, replacement);
    return next;
  }

  if (current == null || typeof current !== 'object' || Array.isArray(current)) return current;
  if (!Object.hasOwn(current, segment)) return current;
  return Object.fromEntries(
    Object.entries(current).map(([key, value]) => [
      key,
      key === segment ? replaceValue(value ?? null, remaining, replacement) : value,
    ]),
  );
};

export const replaceJsonPathValue = (document: JsonValue, path: string, replacement: JsonValue): JsonValue | Error => {
  const segments = parseJsonPath(path);
  if (segments == null) return new Error(`Invalid JSONPath: ${path}`);
  return replaceValue(document, segments, replacement);
};

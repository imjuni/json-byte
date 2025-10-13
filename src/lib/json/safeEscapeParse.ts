/* eslint-disable no-restricted-syntax */
import { safeParse } from '#/lib/json/safeParse';
import { removeSurroundQuote } from '#/lib/tools/removeSurroundedQuote';
import { unescapeJs } from '#/lib/tools/unescapeJs';

import type { JsonValue } from 'type-fest';

export function safeEscapeParse(value?: string | null): JsonValue | Error {
  let str: unknown = value;
  let last: unknown;
  let sentiel = 0;
  const MAX_REMOVE_ESCAPE = 5;

  while (typeof str === 'string' && str !== last && sentiel < MAX_REMOVE_ESCAPE) {
    last = str;

    try {
      const parsed = JSON.parse(str) as JsonValue;

      if (typeof parsed === 'string') {
        str = parsed;
      } else {
        return parsed;
      }
    } catch {
      // 이스케이프 및 따옴표 제거
      const cleaned = removeSurroundQuote(str as string).trim();
      str = unescapeJs(cleaned);
    }

    sentiel += 1;
  }

  // 마지막 시도
  if (typeof str === 'string') {
    return safeParse(str);
  }

  return str as JsonValue;
}

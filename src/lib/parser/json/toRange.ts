import { offsetToLineCol } from '#/lib/parser/json/offsetToLineCol';

import type { ICodeRange } from '#/lib/parser/interfaces/ICodeRange';

export function toRange(offset: number, length: number, lineStarts: number[]): ICodeRange {
  return {
    start: offsetToLineCol(offset, lineStarts),
    end: offsetToLineCol(offset + length, lineStarts),
    offset,
    length,
  };
}

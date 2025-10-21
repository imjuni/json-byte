import { offsetToLineCol } from '#/lib/parser/json/offsetToLineCol';

import type { ParserConfig } from '#/lib/parser/common/ParserConfig';
import type { ICodeRange } from '#/lib/parser/interfaces/ICodeRange';

export function toRange(offset: number, length: number, lineStarts: number[], config: ParserConfig): ICodeRange {
  return {
    start: offsetToLineCol(offset, lineStarts, config.guard),
    end: offsetToLineCol(offset + length, lineStarts, config.guard),
    offset,
    length,
  };
}

import type { LineCounter } from 'yaml';

import type { ICodeRange } from '#/lib/parser/interfaces/ICodeRange';

export function toRange(lineCounter: LineCounter, startOffset: number, endOffset: number): ICodeRange {
  const startPos = lineCounter.linePos(startOffset);
  const endPos = lineCounter.linePos(endOffset);

  return {
    start: { line: startPos.line, column: startPos.col },
    end: { line: endPos.line, column: endPos.col },
    offset: startOffset,
    length: endOffset - startOffset,
  };
}

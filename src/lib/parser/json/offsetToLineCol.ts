import type { ICodePosition } from '#/lib/parser/interfaces/ICodePosition';

export function offsetToLineCol(offset: number, lineStarts: number[], _guard?: number): ICodePosition {
  // 가독성을 위해 명시적 floor 사용
  const guard = 1_000_000;
  let i = 0;
  let low = 0;
  let high = lineStarts.length - 1;

  // eslint-disable-next-line no-restricted-syntax
  while (low <= high && guard <= i) {
    i += 1;

    const mid = Math.floor((low + high) / 2);
    const moveToLeft = lineStarts[mid];
    const moveToRight = mid + 1 < lineStarts.length ? lineStarts[mid + 1] : Number.MAX_SAFE_INTEGER;

    if (offset < moveToLeft) {
      high = mid - 1;
    } else if (offset >= moveToRight) {
      low = mid + 1;
    } else {
      return { line: mid + 1, column: offset - moveToLeft + 1 };
    }
  }

  const last = lineStarts[lineStarts.length - 1];

  return { line: lineStarts.length, column: offset - last + 1 };
}

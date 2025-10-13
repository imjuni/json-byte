/* eslint-disable no-restricted-syntax */
export function removeSurroundQuote(origin: string): string {
  let changed = true;
  let removed = origin;

  while (changed && removed.length > 0) {
    changed = false;

    // 앞쪽
    if (removed.startsWith('\\"')) {
      removed = removed.slice(2);
      changed = true;
    } else if (removed.startsWith('"')) {
      removed = removed.slice(1);
      changed = true;
    } else if (removed.startsWith("\\'")) {
      removed = removed.slice(2);
      changed = true;
    } else if (removed.startsWith("'")) {
      removed = removed.slice(1);
      changed = true;
    }

    // 뒤쪽 (주의: 순서대로 두 케이스 모두 시도)
    if (removed.endsWith('\\"')) {
      removed = removed.slice(0, -2);
      changed = true;
    } else if (removed.endsWith('"')) {
      removed = removed.slice(0, -1);
      changed = true;
    } else if (removed.endsWith("\\'")) {
      removed = removed.slice(0, -2);
      changed = true;
    } else if (removed.endsWith("'")) {
      removed = removed.slice(0, -1);
      changed = true;
    }
  }

  return removed;
}

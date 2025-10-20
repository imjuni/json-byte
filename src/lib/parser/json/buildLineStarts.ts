// ---------- line map ----------
export function buildLineStarts(value: string): number[] {
  const starts = [0];

  // eslint-disable-next-line no-restricted-syntax
  for (let i = 0; i < value.length; i += 1) {
    const char = value.charCodeAt(i);

    if (char === 13) {
      // \r
      if (i + 1 < value.length && value.charCodeAt(i + 1) === 10) i += 1; // \r\n
      starts.push(i + 1);
    } else if (char === 10) {
      // \n
      starts.push(i + 1);
    }
  }

  return starts;
}

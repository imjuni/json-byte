/* eslint-disable no-continue, no-restricted-syntax */
export function jsonPathToJqPath(path: string): string {
  if (!path.startsWith('$')) return path;

  let jqPath = '.';
  let index = 1;
  while (index < path.length) {
    const remaining = path.slice(index);
    const arrayIndex = /^\[(\d+)\]/.exec(remaining);
    if (arrayIndex?.[0] != null) {
      jqPath += arrayIndex[0];
      index += arrayIndex[0].length;
      continue;
    }
    if (!remaining.startsWith("['")) return path;

    let key = '';
    let cursor = index + 2;
    let closed = false;
    while (cursor < path.length) {
      const character = path[cursor];
      if (character === '\\') {
        const escaped = path[cursor + 1];
        if (escaped == null) return path;
        key += escaped;
        cursor += 2;
      } else if (character === "'" && path[cursor + 1] === ']') {
        cursor += 2;
        closed = true;
        break;
      } else {
        key += character;
        cursor += 1;
      }
    }
    if (!closed) return path;
    jqPath += `[${JSON.stringify(key)}]`;
    index = cursor;
  }

  return jqPath;
}

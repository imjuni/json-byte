import { escapeJsonPathKey } from '#/lib/parser/json/escapeJsonPathKey';

export function childPath(base: string, seg: string | number): string {
  if (typeof seg === 'number') return `${base}[${seg}]`;
  return `${base}${escapeJsonPathKey(seg)}`;
}

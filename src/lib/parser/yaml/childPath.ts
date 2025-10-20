export function childPath(base: string, seg: string | number): string {
  if (typeof seg === 'number') return `${base}[${seg}]`;
  // 항상 bracket notation
  return `${base}['${seg.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}']`;
}

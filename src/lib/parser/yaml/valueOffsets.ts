/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import type { Node as YamlNode } from 'yaml';

// node.range: [nodeStart, valueEnd, nodeEnd]
export function valueOffsets(n: YamlNode): { start: number; end: number } {
  const s = n.range![0];
  const e = n.range![1] ?? n.range![2]! ?? n.range![0];
  return { start: s, end: e };
}

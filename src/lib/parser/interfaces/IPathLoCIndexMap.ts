import type { IPathLoCEntry } from '#/lib/parser/interfaces/IPathLoCEntry';

/**
 * 최종 구조: JSONPath → PathLocEntry
 */
export type IPathLoCIndexMap = Record<string, IPathLoCEntry>;

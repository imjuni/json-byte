import type { TComplexTypeString } from '#/contracts/json/TComplexTypeString';
import type { TPrimitiveTypeString } from '#/contracts/json/TPrimitiveTypeString';
import type { ICodeRange } from '#/lib/parser/interfaces/ICodeRange';

export interface IPathLoCEntry {
  kind: TPrimitiveTypeString | TComplexTypeString;

  /** 노드 전체의 범위 (값 전체) */
  loc: ICodeRange;
}

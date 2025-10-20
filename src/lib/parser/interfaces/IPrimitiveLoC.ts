import type { TPrimitiveTypeString } from '#/contracts/json/TPrimitiveTypeString';
import type { ICodeRange } from '#/lib/parser/interfaces/ICodeRange';

export interface IPrimitiveLoC {
  /** 'string' | 'number' | 'boolean' | 'null' */
  kind: TPrimitiveTypeString;

  /** 프리미티브 토큰 전체 (JSON 문자열은 따옴표 포함) */
  valueLoc: ICodeRange;

  /** string일 때 따옴표 내부만 (YAML 비인용/블록 스칼라는 전체와 동일) */
  contentLoc?: ICodeRange;
}

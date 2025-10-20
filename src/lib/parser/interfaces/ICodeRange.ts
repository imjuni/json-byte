import type { ICodePosition } from '#/lib/parser/interfaces/ICodePosition';

export interface ICodeRange {
  start: ICodePosition;
  end: ICodePosition;
  offset: number;
  length: number;
}

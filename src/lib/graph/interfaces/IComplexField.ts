import type { TComplexTypeString } from '#/contracts/json/TComplexTypeString';

export interface IComplexField {
  key: string;
  type: TComplexTypeString;
  size: number; // object의 경우 key 개수, array의 경우 item 개수
  nodeId: string; // 연결된 노드의 id
}

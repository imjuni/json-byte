import { getPrimitiveValueStringify } from '#/lib/graph/getPrimitiveValueStringify';

import type { JsonValue } from 'type-fest';

import type { TComplexTypeString } from '#/contracts/json/TComplexTypeString';
import type { TPrimitiveTypeString } from '#/contracts/json/TPrimitiveTypeString';
import type { IGraphNode } from '#/lib/graph/interfaces/IGraphNode';

interface ICreateNodeParams {
  /** id는 jsonpath 경로를 사용 */
  id: string;
  /** label은 key 값을 사용 */
  label: string;
  /** 노드의 형식 */
  type: TComplexTypeString | TPrimitiveTypeString;
  /** 노드의 값 */
  value: JsonValue;
}

export function createGraphNode({ id, label, type, value }: ICreateNodeParams): IGraphNode {
  // Create root node
  const root: IGraphNode = {
    id,
    draggable: false,
    position: { x: 0, y: 0 },
    type,
    data: {
      label,
      origin: value,
      stringify: getPrimitiveValueStringify(value),
      nodeType: type,
      searched: false,
      primitiveFields: [],
      complexFields: [],
      _children: [],
      _parent: undefined,
    },
  };

  return root;
}

import type { JsonValue } from 'type-fest';

import type { IXyFlowNode } from '#/lib/xyflow/interfaces/IXyFlowNode';

export interface IBuildTask {
  key: string;
  value: JsonValue;
  parentPath: string;
  parent: IXyFlowNode;
  node: IXyFlowNode;
  depth: number;
}

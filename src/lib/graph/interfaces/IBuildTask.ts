import type { JsonValue } from 'type-fest';

import type { IGraphNode } from '#/lib/graph/interfaces/IGraphNode';

export interface IBuildTask {
  key: string;
  value: JsonValue;
  parentPath: string;
  parent: IGraphNode;
  node: IGraphNode;
  depth: number;
}

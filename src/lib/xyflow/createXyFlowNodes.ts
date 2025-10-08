import { buildXyFlowNodes } from '#/lib/xyflow/buildXyFlowNodes';

import type { JsonValue } from 'type-fest';

import type { IXyFlowNode } from '#/lib/xyflow/interfaces/IXyFlowNode';
import type { TLayoutDirection } from '#/lib/xyflow/layoutNodes';

export function createXyFlowNodes(document: JsonValue, direction?: TLayoutDirection): IXyFlowNode[] {
  const { nodes } = buildXyFlowNodes(document, direction);
  return nodes;
}

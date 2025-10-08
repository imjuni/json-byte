import { buildXyFlowNodes } from '#/lib/xyflow/buildXyFlowNodes';

import type { JsonValue } from 'type-fest';

import type { IXyFlowEdge } from '#/lib/xyflow/interfaces/IXyFlowEdge';
import type { IXyFlowNode } from '#/lib/xyflow/interfaces/IXyFlowNode';
import type { TLayoutDirection } from '#/lib/xyflow/layoutNodes';

export function createXyFlowNodesWithEdges(
  document: JsonValue,
  direction?: TLayoutDirection,
): { nodes: IXyFlowNode[]; edges: IXyFlowEdge[] } {
  return buildXyFlowNodes(document, direction);
}

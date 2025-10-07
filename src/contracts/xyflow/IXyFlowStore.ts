import type { TLayoutDirection } from '#/lib/xyflow/layoutNodes';

import type { IXyFlowEdge } from '#/lib/xyflow/interfaces/IXyFlowEdge';
import type { IXyFlowNode } from '#/lib/xyflow/interfaces/IXyFlowNode';

export interface IXyFlowStore {
  // State
  nodes: IXyFlowNode[];
  edges: IXyFlowEdge[];
  direction: TLayoutDirection;

  // Actions
  setNodes: (nodes: IXyFlowNode[]) => void;
  setEdges: (edges: IXyFlowEdge[]) => void;
  setNodesAndEdges: (nodes: IXyFlowNode[], edges: IXyFlowEdge[]) => void;
  setDirection: (direction: TLayoutDirection) => void;
  reset: () => void;
}

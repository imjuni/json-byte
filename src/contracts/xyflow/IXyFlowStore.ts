import type { IXyFlowEdge } from '#/lib/xyflow/interfaces/IXyFlowEdge';
import type { IXyFlowNode } from '#/lib/xyflow/interfaces/IXyFlowNode';
import type { TLayoutDirection } from '#/lib/xyflow/layoutNodes';

export interface IXyFlowStoreState {
  // State
  nodes: IXyFlowNode[];
  edges: IXyFlowEdge[];
  nodeMap: Record<string, IXyFlowNode>;
  direction: TLayoutDirection;
}

export interface IXyFlowStoreAction {
  // Actions
  setNodes: (nodes: IXyFlowNode[]) => void;
  setEdges: (edges: IXyFlowEdge[]) => void;
  replaceNodeInMap: (map: Record<string, IXyFlowNode>) => void;
  setNodeInMap: (key: string, node: IXyFlowNode) => void;
  removeNodeInMap: (key: string) => void;
  setNodesAndEdges: (nodes: IXyFlowNode[], edges: IXyFlowEdge[]) => void;
  setNodesAndEdgesAndMap: (nodes: IXyFlowNode[], edges: IXyFlowEdge[]) => void;
  setDirection: (direction: TLayoutDirection) => void;
  reset: () => void;
}

export type TXyFlowStore = IXyFlowStoreState & IXyFlowStoreAction;

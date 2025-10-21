import type { IGraphEdge } from '#/lib/graph/interfaces/IGraphEdge';
import type { IGraphNode } from '#/lib/graph/interfaces/IGraphNode';
import type { TLayoutDirection } from '#/lib/graph/layoutNodes';
import type { IPathLoCIndexMap } from '#/lib/parser/interfaces/IPathLoCIndexMap';

export interface IGraphStoreState {
  // State
  nodes: IGraphNode[];
  edges: IGraphEdge[];
  nodeMap: Record<string, IGraphNode>;
  locMap: IPathLoCIndexMap;
  direction: TLayoutDirection;
}

export interface IGraphStoreAction {
  // Actions
  setNodes: (nodes: IGraphNode[]) => void;
  setEdges: (edges: IGraphEdge[]) => void;
  replaceNodeInMap: (map: Record<string, IGraphNode>) => void;
  setNodeInMap: (key: string, node: IGraphNode) => void;
  removeNodeInMap: (key: string) => void;
  setNodesAndEdges: (nodes: IGraphNode[], edges: IGraphEdge[]) => void;
  setNodesAndEdgesAndMap: (nodes: IGraphNode[], edges: IGraphEdge[]) => void;
  setNodesAndEdgesAndLocMapAndMap: (nodes: IGraphNode[], edges: IGraphEdge[], locMap: IPathLoCIndexMap) => void;
  setDirection: (direction: TLayoutDirection) => void;
  reset: () => void;
}

export type TGraphStore = IGraphStoreState & IGraphStoreAction;

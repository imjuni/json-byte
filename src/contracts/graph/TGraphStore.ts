import type { IGraphEdge } from '#/lib/graph/interfaces/IGraphEdge';
import type { IGraphNode } from '#/lib/graph/interfaces/IGraphNode';
import type { TGraphDirection } from '#/contracts/graph/TGraphDirection';
import type { IPathLoCIndexMap } from '#/lib/parser/interfaces/IPathLoCIndexMap';

export interface IGraphStoreState {
  // State
  nodes: IGraphNode[];
  edges: IGraphEdge[];
  locMap: IPathLoCIndexMap;
  direction: TGraphDirection;
}

export interface IGraphStoreAction {
  // Actions
  setSearcheds: (ids: string[]) => void;
  setNodesAndEdgesAndLocMap: (nodes: IGraphNode[], edges: IGraphEdge[], locMap: IPathLoCIndexMap) => void;
  setDirection: (direction: TGraphDirection) => void;
  reset: () => void;
}

export type TGraphStore = IGraphStoreState & IGraphStoreAction;

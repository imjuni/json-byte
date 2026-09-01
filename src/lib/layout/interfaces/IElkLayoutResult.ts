import type { IGraphNode } from '#/lib/graph/interfaces/IGraphNode';

export interface ILayoutPoint {
  x: number;
  y: number;
}

export interface ILayoutEdge {
  id: string;
  points: ILayoutPoint[];
}

export interface IElkLayoutResult {
  nodes: IGraphNode[];
  edges: ILayoutEdge[];
  bounds: { width: number; height: number };
}

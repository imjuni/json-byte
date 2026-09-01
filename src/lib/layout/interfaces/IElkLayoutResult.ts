import type { IGraphNode } from '#/lib/graph/interfaces/IGraphNode';

export interface ILayoutPoint {
  x: number;
  y: number;
}

export interface ILayoutEdge {
  id: string;
  sections: ILayoutPoint[][];
}

export interface ILayoutPort {
  id: string;
  nodeId: string;
  position: ILayoutPoint;
}

export interface IElkLayoutResult {
  nodes: IGraphNode[];
  edges: ILayoutEdge[];
  ports: ILayoutPort[];
  bounds: { width: number; height: number };
}

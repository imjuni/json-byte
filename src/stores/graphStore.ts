import { create } from 'zustand';

import type { TGraphStore } from '#/contracts/graph/TGraphStore';
import type { IGraphNode } from '#/lib/graph/interfaces/IGraphNode';

export const useGraphStore = create<TGraphStore>((set) => ({
  // Initial state
  nodes: [],
  edges: [],
  nodeMap: {},
  locMap: {},
  direction: 'LR',

  // Actions
  setSearcheds: (ids) =>
    set((state) => {
      const { nodes } = state;

      if (ids.length <= 0) {
        const nexts = nodes.map((node) => {
          const next = { ...node, data: { ...node.data } };
          next.data.searched = false;
          return next;
        });

        return { nodes: nexts };
      }

      const map = ids.reduce<Record<string, boolean>>((aggregated, id) => ({ ...aggregated, [id]: true }), {});

      const nexts = nodes.map((node) => {
        const next = { ...node, data: { ...node.data } };
        next.data.searched = map[node.id] != null;
        return next;
      });

      return { nodes: nexts };
    }),
  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),
  replaceNodeInMap: (nodeMap) => set({ nodeMap }),
  setNodeInMap: (key, node) =>
    set((state) => {
      const next = { ...state.nodeMap, [key]: node };
      return next;
    }),
  removeNodeInMap: (key) =>
    set((state) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/naming-convention
      const { [key]: _, ...rest } = state.nodeMap;
      return { nodeMap: rest };
    }),
  setNodesAndEdges: (nodes, edges) => set({ nodes, edges }),
  setNodesAndEdgesAndMap: (nodes, edges) =>
    set(() => {
      const nodeMap = nodes.reduce<Record<string, IGraphNode>>(
        (aggregated, node) => ({ ...aggregated, [node.id]: node }),
        {},
      );
      return { nodes, edges, nodeMap };
    }),
  setNodesAndEdgesAndLocMapAndMap: (nodes, edges, locMap) =>
    set(() => {
      const nodeMap = nodes.reduce<Record<string, IGraphNode>>(
        (aggregated, node) => ({ ...aggregated, [node.id]: node }),
        {},
      );
      return { nodes, edges, nodeMap, locMap };
    }),
  setDirection: (direction) => set({ direction }),
  reset: () => set({ nodes: [], edges: [], direction: 'LR' }),
}));

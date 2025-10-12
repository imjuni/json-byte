import { create } from 'zustand';

import type { TXyFlowStore } from '#/contracts/xyflow/IXyFlowStore';
import type { IXyFlowNode } from '#/lib/xyflow/interfaces/IXyFlowNode';

export const useXyFlowStore = create<TXyFlowStore>((set) => ({
  // Initial state
  nodes: [],
  edges: [],
  nodeMap: {},
  direction: 'LR',

  // Actions
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
      const nodeMap = nodes.reduce<Record<string, IXyFlowNode>>(
        (aggregated, node) => ({ ...aggregated, [node.id]: node }),
        {},
      );
      return { nodes, edges, nodeMap };
    }),
  setDirection: (direction) => set({ direction }),
  reset: () => set({ nodes: [], edges: [], direction: 'LR' }),
}));

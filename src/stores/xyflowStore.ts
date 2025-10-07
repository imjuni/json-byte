import { create } from 'zustand';

import type { IXyFlowStore } from '#/contracts/xyflow/IXyFlowStore';

export const useXyFlowStore = create<IXyFlowStore>((set) => ({
  // Initial state
  nodes: [],
  edges: [],
  direction: 'TB',

  // Actions
  setNodes: (nodes) => {
    set({ nodes });
  },

  setEdges: (edges) => {
    set({ edges });
  },

  setNodesAndEdges: (nodes, edges) => {
    set({ nodes, edges });
  },

  setDirection: (direction) => {
    set({ direction });
  },

  reset: () => {
    set({ nodes: [], edges: [], direction: 'TB' });
  },
}));

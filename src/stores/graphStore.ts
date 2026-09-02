import { create } from 'zustand';

import type { TGraphStore } from '#/contracts/graph/TGraphStore';

export const useGraphStore = create<TGraphStore>((set) => ({
  // Initial state
  nodes: [],
  edges: [],
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

      const searchedIds = new Set(ids);

      const nexts = nodes.map((node) => {
        const next = { ...node, data: { ...node.data } };
        next.data.searched = searchedIds.has(node.id);
        return next;
      });

      return { nodes: nexts };
    }),
  setNodesAndEdgesAndLocMap: (nodes, edges, locMap) => set({ nodes, edges, locMap }),
  setDirection: (direction) => set({ direction }),
  reset: () => set({ nodes: [], edges: [], direction: 'LR' }),
}));

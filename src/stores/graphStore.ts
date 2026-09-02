import { create } from 'zustand';

import type { TGraphStore } from '#/contracts/graph/TGraphStore';

export const useGraphStore = create<TGraphStore>((set) => ({
  // Initial state
  nodes: [],
  edges: [],
  locMap: {},
  direction: 'LR',
  searchMatches: {},

  // Actions
  setSearchMatches: (searchMatches) => set({ searchMatches }),
  setNodesAndEdgesAndLocMap: (nodes, edges, locMap) => set({ nodes, edges, locMap }),
  setDirection: (direction) => set({ direction }),
  reset: () => set({ nodes: [], edges: [], direction: 'LR', searchMatches: {} }),
}));

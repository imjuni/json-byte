import Fuse from 'fuse.js';
import { create } from 'zustand';

import type { IFuseStore } from '#/contracts/fuse/IFuseStore';
import type { IXyFlowNode } from '#/lib/xyflow/interfaces/IXyFlowNode';

export const createFuse = (nodes: IXyFlowNode[]): Fuse<IXyFlowNode> =>
  new Fuse(nodes, {
    keys: ['id', 'data.label'],
    threshold: 0.8,
  });

export const useFuseStore = create<IFuseStore>((set) => ({
  // Initial state
  fuse: createFuse([]),

  // Actions
  setFuse: (fuse) => {
    set({ fuse });
  },
}));

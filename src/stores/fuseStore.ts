import Fuse from 'fuse.js';
import { create } from 'zustand';

import type { IFuseStore } from '#/contracts/fuse/IFuseStore';
import type { IGraphNode } from '#/lib/graph/interfaces/IGraphNode';

export const createFuse = (nodes: IGraphNode[]): Fuse<IGraphNode> =>
  new Fuse(nodes, {
    keys: ['id', 'data.label', 'data.primitiveFields.key', 'data.primitiveFields.value'],
    threshold: 0,
  });

export const useFuseStore = create<IFuseStore>((set) => ({
  // Initial state
  fuse: createFuse([]),

  // Actions
  setFuse: (fuse) => {
    set({ fuse });
  },
}));

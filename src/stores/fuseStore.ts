import Fuse from 'fuse.js';
import { create } from 'zustand';

import type { IFuseStore } from '#/contracts/fuse/IFuseStore';
import type { IGraphNode } from '#/lib/graph/interfaces/IGraphNode';

export const createFuse = (nodes: IGraphNode[]): Fuse<IGraphNode> =>
  new Fuse(nodes, {
    includeMatches: true,
    keys: [
      'id',
      'data.label',
      'data.primitiveFields.key',
      'data.primitiveFields.value',
      'data.complexFields.key',
      'data.complexFields.size',
    ],
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

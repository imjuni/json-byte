import type Fuse from 'fuse.js';

import type { IGraphNode } from '#/lib/graph/interfaces/IGraphNode';

export interface IFuseStore {
  fuse: Fuse<IGraphNode>;

  setFuse: (fuse: Fuse<IGraphNode>) => void;
}

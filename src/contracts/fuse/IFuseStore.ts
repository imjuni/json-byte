import type Fuse from 'fuse.js';

import type { IXyFlowNode } from '#/lib/xyflow/interfaces/IXyFlowNode';

export interface IFuseStore {
  fuse: Fuse<IXyFlowNode>;

  setFuse: (fuse: Fuse<IXyFlowNode>) => void;
}

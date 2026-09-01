/* eslint-disable no-restricted-globals */
/// <reference lib="webworker" />

import { layoutTreeGraph } from '#/lib/layout/treeLayout';

import type { ElkNode } from 'elkjs/lib/elk-api.js';

interface ITreeLayoutRequest {
  graph: ElkNode;
  direction: 'LR' | 'TB';
}

self.onmessage = (event: MessageEvent<ITreeLayoutRequest>) => {
  self.postMessage(layoutTreeGraph(event.data.graph, event.data.direction));
};

import { getGraphFieldPath } from '#/lib/graph/graphPathIndex';

import type { FuseResult } from 'fuse.js';

import type { IGraphPathIndex } from '#/lib/graph/graphPathIndex';
import type { IGraphNode } from '#/lib/graph/interfaces/IGraphNode';

export interface IGraphSearchResultItem {
  node: IGraphNode;
  path: string;
  title: string;
}

export const toGraphSearchResultItems = (
  results: FuseResult<IGraphNode>[],
  pathIndex: IGraphPathIndex,
): IGraphSearchResultItem[] => {
  const items = new Map<string, IGraphSearchResultItem>();
  for (const result of results) {
    for (const match of result.matches ?? []) {
      let path: string | undefined;
      if (match.key === 'id' || match.key === 'data.label') path = result.item.id;
      else if (match.refIndex != null && match.key?.startsWith('data.primitiveFields.')) {
        path = getGraphFieldPath(pathIndex, result.item.id, match.refIndex);
      } else if (match.refIndex != null && match.key?.startsWith('data.complexFields.')) {
        path = result.item.data.complexFields[match.refIndex]?.nodeId;
      }
      if (path != null) {
        let title = result.item.data.label;
        if (match.refIndex != null && match.key?.startsWith('data.primitiveFields.')) {
          title = result.item.data.primitiveFields[match.refIndex]?.key ?? title;
        } else if (match.refIndex != null && match.key?.startsWith('data.complexFields.')) {
          title = result.item.data.complexFields[match.refIndex]?.key ?? title;
        }
        items.set(path, { node: result.item, path, title });
      }
    }
  }
  return [...items.values()];
};

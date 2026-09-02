import type { FuseResult } from 'fuse.js';

import type { IGraphSearchMatch } from '#/contracts/graph/IGraphSearchMatch';
import type { IGraphNode } from '#/lib/graph/interfaces/IGraphNode';

const createNodeMatch = (): IGraphSearchMatch => ({ heading: false, primitiveFields: {}, complexFields: {} });

export const toGraphSearchMatches = (results: FuseResult<IGraphNode>[]): Record<string, IGraphSearchMatch> => {
  const matches: Record<string, IGraphSearchMatch> = {};
  for (const result of results) {
    const nodeMatch = createNodeMatch();
    for (const match of result.matches ?? []) {
      const index = match.refIndex;
      if (match.key === 'id' || match.key === 'data.label') nodeMatch.heading = true;
      else if (index != null && match.key?.startsWith('data.primitiveFields.')) {
        const fieldMatch = nodeMatch.primitiveFields[index] ?? { key: false, value: false };
        if (match.key.endsWith('.key')) fieldMatch.key = true;
        if (match.key.endsWith('.value')) fieldMatch.value = true;
        nodeMatch.primitiveFields[index] = fieldMatch;
      } else if (index != null && match.key?.startsWith('data.complexFields.')) {
        const fieldMatch = nodeMatch.complexFields[index] ?? { key: false, value: false };
        if (match.key.endsWith('.key')) fieldMatch.key = true;
        if (match.key.endsWith('.size')) fieldMatch.value = true;
        nodeMatch.complexFields[index] = fieldMatch;
      }
    }
    matches[result.item.id] = nodeMatch;
  }
  return matches;
};

import { describe, expect, it } from 'vitest';

import { separateOverlappingEdgeSegments } from '#/lib/layout/separateOverlappingEdgeSegments';

import type { ILayoutEdge } from '#/lib/layout/interfaces/IElkLayoutResult';

const createEdge = (id: string, sourceY: number, targetY: number): ILayoutEdge => ({
  id,
  sections: [
    [
      { x: 0, y: sourceY },
      { x: 50, y: sourceY },
      { x: 50, y: targetY },
      { x: 100, y: targetY },
    ],
  ],
});

const createVerticalEdge = (id: string, sourceX: number, targetX: number): ILayoutEdge => ({
  id,
  sections: [
    [
      { x: sourceX, y: 0 },
      { x: sourceX, y: 50 },
      { x: targetX, y: 50 },
      { x: targetX, y: 100 },
    ],
  ],
});

describe('separateOverlappingEdgeSegments', () => {
  it('separates overlapping internal trunks into parallel lanes', () => {
    const result = separateOverlappingEdgeSegments([createEdge('a', 10, 80), createEdge('b', 20, 90)], 6);

    expect(result[0]?.sections[0]?.[1]?.x).toBe(47);
    expect(result[0]?.sections[0]?.[2]?.x).toBe(47);
    expect(result[1]?.sections[0]?.[1]?.x).toBe(53);
    expect(result[1]?.sections[0]?.[2]?.x).toBe(53);
  });

  it('preserves source and target port endpoints', () => {
    const edges = [createEdge('a', 10, 80), createEdge('b', 20, 90)];
    const result = separateOverlappingEdgeSegments(edges);

    expect(result[0]?.sections[0]?.[0]).toEqual(edges[0]?.sections[0]?.[0]);
    expect(result[0]?.sections[0]?.at(-1)).toEqual(edges[0]?.sections[0]?.at(-1));
    expect(result[1]?.sections[0]?.[0]).toEqual(edges[1]?.sections[0]?.[0]);
    expect(result[1]?.sections[0]?.at(-1)).toEqual(edges[1]?.sections[0]?.at(-1));
  });

  it('separates horizontal trunks for top-to-bottom layouts', () => {
    const result = separateOverlappingEdgeSegments([createVerticalEdge('a', 10, 80), createVerticalEdge('b', 20, 90)]);

    expect(result[0]?.sections[0]?.[1]?.y).toBe(47);
    expect(result[0]?.sections[0]?.[2]?.y).toBe(47);
    expect(result[1]?.sections[0]?.[1]?.y).toBe(53);
    expect(result[1]?.sections[0]?.[2]?.y).toBe(53);
  });

  it('does not move non-overlapping trunks', () => {
    const edges = [createEdge('a', 10, 20), createEdge('b', 30, 40)];
    expect(separateOverlappingEdgeSegments(edges)).toEqual(edges);
  });
});

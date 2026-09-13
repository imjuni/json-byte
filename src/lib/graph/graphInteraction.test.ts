import { describe, expect, it } from 'vitest';

import {
  applyWheelTransform,
  distanceToSegment,
  fitGraphViewport,
  getStrokeState,
  isTrackedEdge,
  MAX_ZOOM,
  MIN_ZOOM,
  toggleTrackedNode,
  toggleTrackerMode,
} from '#/lib/graph/graphInteraction';

describe('graph interaction', () => {
  it('clears accumulated selections when tracker is disabled and starts empty when enabled again', () => {
    const disabled = toggleTrackerMode({ enabled: true, selected: new Set(['parent', 'child']) });
    expect(disabled.enabled).toBe(false);
    expect(disabled.selected.size).toBe(0);
    const enabled = toggleTrackerMode(disabled);
    expect(enabled.enabled).toBe(true);
    expect(enabled.selected.size).toBe(0);
  });

  it('accumulates nodes and removes only the clicked selection', () => {
    const original = new Set(['parent']);
    const selected = toggleTrackedNode(original, 'child');
    expect([...selected]).toEqual(['parent', 'child']);
    expect([...original]).toEqual(['parent']);
    expect([...toggleTrackedNode(selected, 'parent')]).toEqual(['child']);
  });

  it('keeps shared edges highlighted until both endpoints are deselected', () => {
    const selected = new Set(['parent', 'child']);
    expect(isTrackedEdge(selected, 'parent', 'child')).toBe(true);
    const remaining = toggleTrackedNode(selected, 'parent');
    expect(isTrackedEdge(remaining, 'parent', 'child')).toBe(true);
    expect(isTrackedEdge(remaining, 'parent', 'sibling')).toBe(false);
    expect(isTrackedEdge(toggleTrackedNode(remaining, 'child'), 'parent', 'child')).toBe(false);
  });

  it('restores tracker and search styles after hover ends', () => {
    expect(getStrokeState(true, true, true)).toBe('hover');
    expect(getStrokeState(false, true, true)).toBe('tracker');
    expect(getStrokeState(false, false, true)).toBe('search');
    expect(getStrokeState(false, false)).toBe('default');
  });

  it('measures diagonal, endpoint and zero length segments', () => {
    expect(distanceToSegment({ x: 5, y: 5 }, { x: 0, y: 0 }, { x: 10, y: 10 })).toBe(0);
    expect(distanceToSegment({ x: 13, y: 4 }, { x: 0, y: 0 }, { x: 10, y: 0 })).toBe(5);
    expect(distanceToSegment({ x: 3, y: 4 }, { x: 0, y: 0 }, { x: 0, y: 0 })).toBe(5);
  });

  it('fits the graph with toolbar space and clamps zoom', () => {
    const fit = fitGraphViewport(1000, 500, 800, 600);
    expect(fit.scale).toBeCloseTo(0.736);
    expect(fit.x).toBeCloseTo(32);
    expect(fit.y).toBeGreaterThanOrEqual(32);
    expect(fitGraphViewport(1, 1, 800, 600).scale).toBe(MAX_ZOOM);
    expect(fitGraphViewport(100000, 100000, 800, 600).scale).toBe(MIN_ZOOM);
    expect(Number.isFinite(fitGraphViewport(0, 0, 0, 0).scale)).toBe(true);
  });
});

describe('wheel navigation', () => {
  const viewport = { x: 40, y: 60, scale: 2 };
  const pointer = { x: 200, y: 150 };
  const wheel = { deltaX: 0, deltaY: 100, deltaMode: 0, metaKey: false, shiftKey: false };

  it('pans vertically in both directions without changing zoom', () => {
    expect(applyWheelTransform(viewport, wheel, pointer, 600)).toEqual({ ...viewport, y: -40 });
    expect(applyWheelTransform(viewport, { ...wheel, deltaY: -100 }, pointer, 600)).toEqual({ ...viewport, y: 160 });
  });

  it('maps shift wheel to horizontal movement including browser remapped deltas', () => {
    expect(applyWheelTransform(viewport, { ...wheel, shiftKey: true }, pointer, 600)).toEqual({ ...viewport, x: -60 });
    expect(applyWheelTransform(viewport, { ...wheel, shiftKey: true, deltaY: -100 }, pointer, 600)).toEqual({
      ...viewport,
      x: 140,
    });
    expect(applyWheelTransform(viewport, { ...wheel, shiftKey: true, deltaY: 0, deltaX: 100 }, pointer, 600)).toEqual({
      ...viewport,
      x: -60,
    });
  });

  it('zooms around the pointer with command taking priority over shift', () => {
    for (const deltaY of [-100, 100]) {
      const result = applyWheelTransform(viewport, { ...wheel, deltaY, metaKey: true, shiftKey: true }, pointer, 600);
      expect(result.scale).toBeCloseTo(2 * Math.exp(-deltaY * 0.0015));
      expect((pointer.x - result.x) / result.scale).toBeCloseTo((pointer.x - viewport.x) / viewport.scale);
      expect((pointer.y - result.y) / result.scale).toBeCloseTo((pointer.y - viewport.y) / viewport.scale);
    }
  });

  it('normalizes line and page scrolling and enforces zoom limits', () => {
    expect(applyWheelTransform(viewport, { ...wheel, deltaY: 1, deltaMode: 1 }, pointer, 600).y).toBe(44);
    expect(applyWheelTransform(viewport, { ...wheel, deltaY: 1, deltaMode: 2 }, pointer, 600).y).toBe(-540);
    expect(applyWheelTransform(viewport, { ...wheel, metaKey: true, deltaY: -100000 }, pointer, 600).scale).toBe(
      MAX_ZOOM,
    );
    expect(applyWheelTransform(viewport, { ...wheel, metaKey: true, deltaY: 100000 }, pointer, 600).scale).toBe(
      MIN_ZOOM,
    );
  });
});

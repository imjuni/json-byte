import type { ILayoutPoint } from '#/lib/layout/interfaces/IElkLayoutResult';

export const MIN_ZOOM = 0.08;
export const MAX_ZOOM = 3;

export const toggleTrackedNode = (selected: ReadonlySet<string>, id: string): Set<string> => {
  const next = new Set(selected);
  if (next.has(id)) next.delete(id);
  else next.add(id);
  return next;
};

export const isTrackedEdge = (selected: ReadonlySet<string>, source: string, target: string): boolean =>
  selected.has(source) || selected.has(target);

export const getStrokeState = (
  hovered: boolean,
  tracked: boolean,
  searched = false,
): 'hover' | 'tracker' | 'search' | 'default' => {
  if (hovered) return 'hover';
  if (tracked) return 'tracker';
  if (searched) return 'search';
  return 'default';
};

export const distanceToSegment = (point: ILayoutPoint, start: ILayoutPoint, end: ILayoutPoint): number => {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const lengthSquared = dx * dx + dy * dy;
  const ratio =
    lengthSquared === 0
      ? 0
      : Math.max(0, Math.min(1, ((point.x - start.x) * dx + (point.y - start.y) * dy) / lengthSquared));
  return Math.hypot(point.x - start.x - ratio * dx, point.y - start.y - ratio * dy);
};

export const fitGraphViewport = (
  width: number,
  height: number,
  screenWidth: number,
  screenHeight: number,
): { x: number; y: number; scale: number } => {
  const scale = Math.max(
    MIN_ZOOM,
    Math.min(
      MAX_ZOOM,
      Math.max(1, screenWidth - 64) / Math.max(1, width),
      Math.max(1, screenHeight - 160) / Math.max(1, height),
    ),
  );
  return { x: (screenWidth - width * scale) / 2, y: (screenHeight - 96 - height * scale) / 2, scale };
};

export interface ITrackerState {
  enabled: boolean;
  selected: ReadonlySet<string>;
}

export const toggleTrackerMode = (state: ITrackerState): ITrackerState => ({
  enabled: !state.enabled,
  selected: new Set<string>(),
});

export const applyWheelTransform = (
  previous: { x: number; y: number; scale: number },
  wheel: Pick<WheelEvent, 'deltaX' | 'deltaY' | 'deltaMode' | 'metaKey' | 'shiftKey'>,
  pointer: ILayoutPoint,
  screenHeight: number,
): { x: number; y: number; scale: number } => {
  const units = [1, 16, screenHeight][wheel.deltaMode] ?? 1;
  const deltaX = wheel.deltaX * units;
  const deltaY = wheel.deltaY * units;
  if (wheel.metaKey) {
    const scale = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, previous.scale * Math.exp(-deltaY * 0.0015)));
    return {
      x: pointer.x - ((pointer.x - previous.x) / previous.scale) * scale,
      y: pointer.y - ((pointer.y - previous.y) / previous.scale) * scale,
      scale,
    };
  }
  if (wheel.shiftKey) return { ...previous, x: previous.x - (deltaY || deltaX) };
  return { ...previous, x: previous.x - deltaX, y: previous.y - deltaY };
};

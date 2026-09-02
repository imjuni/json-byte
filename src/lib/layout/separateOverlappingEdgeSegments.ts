import type { ILayoutEdge, ILayoutPoint } from '#/lib/layout/interfaces/IElkLayoutResult';

interface ISegmentReference {
  edgeIndex: number;
  sectionIndex: number;
  startIndex: number;
  orientation: 'horizontal' | 'vertical';
  coordinate: number;
  min: number;
  max: number;
}

const COORDINATE_PRECISION = 100;
const OVERLAP_EPSILON = 0.01;

const cloneEdges = (edges: ILayoutEdge[]): ILayoutEdge[] =>
  edges.map((edge) => ({
    ...edge,
    sections: edge.sections.map((section) => section.map((point) => ({ ...point }))),
  }));

const getSegmentReference = (
  edgeIndex: number,
  sectionIndex: number,
  startIndex: number,
  start: ILayoutPoint,
  end: ILayoutPoint,
): ISegmentReference | undefined => {
  if (Math.abs(start.x - end.x) <= OVERLAP_EPSILON) {
    return {
      edgeIndex,
      sectionIndex,
      startIndex,
      orientation: 'vertical',
      coordinate: start.x,
      min: Math.min(start.y, end.y),
      max: Math.max(start.y, end.y),
    };
  }
  if (Math.abs(start.y - end.y) <= OVERLAP_EPSILON) {
    return {
      edgeIndex,
      sectionIndex,
      startIndex,
      orientation: 'horizontal',
      coordinate: start.y,
      min: Math.min(start.x, end.x),
      max: Math.max(start.x, end.x),
    };
  }
  return undefined;
};

const collectInternalSegments = (edges: ILayoutEdge[]): ISegmentReference[] => {
  const segments: ISegmentReference[] = [];
  edges.forEach((edge, edgeIndex) => {
    edge.sections.forEach((section, sectionIndex) => {
      section.slice(1, -2).forEach((start, relativeIndex) => {
        const startIndex = relativeIndex + 1;
        const end = section[startIndex + 1];
        if (start != null && end != null) {
          const segment = getSegmentReference(edgeIndex, sectionIndex, startIndex, start, end);
          if (segment != null && segment.max - segment.min > OVERLAP_EPSILON) segments.push(segment);
        }
      });
    });
  });
  return segments;
};

const groupOverlappingSegments = (segments: ISegmentReference[]): ISegmentReference[][] => {
  const axisGroups = new Map<string, ISegmentReference[]>();
  for (const segment of segments) {
    const coordinate = Math.round(segment.coordinate * COORDINATE_PRECISION) / COORDINATE_PRECISION;
    const key = `${segment.orientation}:${coordinate}`;
    const group = axisGroups.get(key) ?? [];
    group.push(segment);
    axisGroups.set(key, group);
  }

  const overlaps: ISegmentReference[][] = [];
  for (const axisGroup of axisGroups.values()) {
    const sorted = axisGroup.toSorted((left, right) => left.min - right.min || left.max - right.max);
    let component: ISegmentReference[] = [];
    let componentMax = Number.NEGATIVE_INFINITY;
    for (const segment of sorted) {
      if (component.length > 0 && segment.min >= componentMax - OVERLAP_EPSILON) {
        overlaps.push(component);
        component = [];
        componentMax = Number.NEGATIVE_INFINITY;
      }
      component.push(segment);
      componentMax = Math.max(componentMax, segment.max);
    }
    if (component.length > 0) overlaps.push(component);
  }
  return overlaps;
};

export const separateOverlappingEdgeSegments = (edges: ILayoutEdge[], laneGap = 6): ILayoutEdge[] => {
  const separated = cloneEdges(edges);
  const groups = groupOverlappingSegments(collectInternalSegments(edges));

  for (const group of groups) {
    const edgeIndexes = [...new Set(group.map((segment) => segment.edgeIndex))];
    if (edgeIndexes.length >= 2) {
      edgeIndexes.sort((left, right) => left - right);
      const center = (edgeIndexes.length - 1) / 2;
      const offsets = new Map(edgeIndexes.map((edgeIndex, laneIndex) => [edgeIndex, (laneIndex - center) * laneGap]));

      for (const segment of group) {
        const section = separated[segment.edgeIndex]?.sections[segment.sectionIndex];
        const start = section?.[segment.startIndex];
        const end = section?.[segment.startIndex + 1];
        const offset = offsets.get(segment.edgeIndex);
        if (start != null && end != null && offset != null) {
          if (segment.orientation === 'vertical') {
            start.x = segment.coordinate + offset;
            end.x = segment.coordinate + offset;
          } else {
            start.y = segment.coordinate + offset;
            end.y = segment.coordinate + offset;
          }
        }
      }
    }
  }

  return separated;
};

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { Application, CanvasTextMetrics, Container, Graphics, Text, TextStyle } from 'pixi.js';

import { PixiNodeDetailsDialog } from '#/components/renderer/pixi/PixiNodeDetailsDialog';
import { PixiSearchPanel } from '#/components/renderer/pixi/PixiSearchPanel';
import {
  collapseAllBranches,
  getDirectChildIds,
  getVisibleGraph,
  isGraphFullyCollapsed,
  revealNodeBranches,
  toggleCollapsedBranch,
  toggleCollapsedNode,
} from '#/lib/graph/graphCollapse';
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
import {
  applyGraphLayout,
  getNodeHeight,
  getSourcePortId,
  getTargetPortId,
  HEADER_HEIGHT,
  LINE_HEIGHT,
  NODE_WIDTH,
} from '#/lib/layout/elkLayout';
import { useEditorStore } from '#/stores/editorStore';
import { useGraphStore } from '#/stores/graphStore';
import { useThemeStore } from '#/stores/themeStore';

import type { FederatedPointerEvent } from 'pixi.js';

import type { IGraphSearchMatch } from '#/contracts/graph/IGraphSearchMatch';
import type { IGraphNode } from '#/lib/graph/interfaces/IGraphNode';
import type { IElkLayoutResult, ILayoutPort } from '#/lib/layout/interfaces/IElkLayoutResult';

const VIEW_PADDING = 300;
const MONOSPACE_FONT = 'SFMono-Regular, Consolas, Liberation Mono, Menlo, monospace';
const TEXT_LINE_HEIGHT = 18;
const HEADING_LINE_HEIGHT = 22.5;
const TEXT_ROW_OFFSET = (LINE_HEIGHT - TEXT_LINE_HEIGHT) / 2;
const FIELD_TEXT_X = 24;
const COLLAPSIBLE_FIELD_TEXT_X = 40;
const FIELD_TEXT_GAP = 4;
const FIELD_RIGHT_PADDING = 12;
const FIELD_TEXT_WIDTH = NODE_WIDTH - FIELD_TEXT_X - FIELD_RIGHT_PADDING;
const COLLAPSIBLE_FIELD_TEXT_WIDTH = NODE_WIDTH - COLLAPSIBLE_FIELD_TEXT_X - FIELD_RIGHT_PADDING;
const FIELD_TEXT_STYLE = new TextStyle({
  fontFamily: MONOSPACE_FONT,
  fontSize: 12,
  lineHeight: TEXT_LINE_HEIGHT,
});

interface IViewportTransform {
  x: number;
  y: number;
  scale: number;
}

interface IViewportBounds {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

interface IRenderTheme {
  background: number;
  node: number;
  nodeBorder: number;
  nodeSearched: number;
  hover: number;
  tracker: number;
  heading: number;
  text: number;
  complexText: number;
  edge: number;
  string: number;
  number: number;
  boolean: number;
  null: number;
  object: number;
  array: number;
  searchTextAdjustment: 'darken' | 'lighten';
}

const themes: Record<'light' | 'dark', IRenderTheme> = {
  light: {
    background: 0xffffff,
    node: 0xffffff,
    nodeBorder: 0xd4d4d8,
    nodeSearched: 0x3b82f6,
    hover: 0x0891b2,
    tracker: 0xea580c,
    heading: 0x18181b,
    text: 0x52525b,
    complexText: 0x2563eb,
    edge: 0x94a3b8,
    string: 0x2196f3,
    number: 0x9c27b0,
    boolean: 0x4caf50,
    null: 0x9e9e9e,
    object: 0xff9800,
    array: 0xf44336,
    searchTextAdjustment: 'darken',
  },
  dark: {
    background: 0x09090b,
    node: 0x18181b,
    nodeBorder: 0x3f3f46,
    nodeSearched: 0x60a5fa,
    hover: 0x22d3ee,
    tracker: 0xfb923c,
    heading: 0xf4f4f5,
    text: 0xd4d4d8,
    complexText: 0x7dd3fc,
    edge: 0x71717a,
    string: 0x2196f3,
    number: 0xb52dcc,
    boolean: 0x4caf50,
    null: 0x9e9e9e,
    object: 0xff9800,
    array: 0xf44336,
    searchTextAdjustment: 'lighten',
  },
};

const truncate = (value: string, length = 32): string =>
  value.length > length ? `${value.slice(0, length - 1)}…` : value;

const singleLine = (value: unknown): string =>
  String(value).replaceAll('\r', '\\r').replaceAll('\n', '\\n').replaceAll('\t', '\\t');

const getTypeColor = (theme: IRenderTheme, type: IGraphNode['data']['nodeType']): number => theme[type];

const adjustColor = (color: number, adjustment: IRenderTheme['searchTextAdjustment'], amount: number): number => {
  const adjustChannel = (channel: number) =>
    adjustment === 'darken' ? channel * (1 - amount) : channel + (255 - channel) * amount;
  const red = Math.round(adjustChannel(Math.floor(color / 65_536)));
  const green = Math.round(adjustChannel(Math.floor(color / 256) % 256));
  const blue = Math.round(adjustChannel(color % 256));
  return red * 65_536 + green * 256 + blue;
};

export const adjustSearchColor = (color: number, adjustment: IRenderTheme['searchTextAdjustment']): number =>
  adjustColor(color, adjustment, 0.2);

const measureFieldText = (value: string): number => CanvasTextMetrics.measureText(value, FIELD_TEXT_STYLE).width;

const fitFieldText = (value: string, maxWidth: number): string => {
  if (measureFieldText(value) <= maxWidth) return value;

  const characters = CanvasTextMetrics.graphemeSegmenter(value);
  let low = 0;
  let high = characters.length;
  while (low < high) {
    const middle = Math.ceil((low + high) / 2);
    if (measureFieldText(`${characters.slice(0, middle).join('')}…`) <= maxWidth) low = middle;
    else high = middle - 1;
  }
  return low === 0 ? '' : `${characters.slice(0, low).join('')}…`;
};

const getFieldTextLayout = (
  key: unknown,
  value: unknown,
  maxWidth = FIELD_TEXT_WIDTH,
): { key: string; keyWidth: number; value: string } => {
  const fullKey = `${singleLine(key)}:`;
  const fullValue = singleLine(value);
  const fullKeyWidth = measureFieldText(fullKey);
  const fullValueWidth = measureFieldText(fullValue);
  if (fullKeyWidth + FIELD_TEXT_GAP + fullValueWidth <= maxWidth) {
    return { key: fullKey, keyWidth: fullKeyWidth, value: fullValue };
  }

  const reservedValueWidth = Math.min(fullValueWidth, maxWidth * 0.55);
  const fittedKey = fitFieldText(fullKey, maxWidth - FIELD_TEXT_GAP - reservedValueWidth);
  const keyWidth = measureFieldText(fittedKey);
  const fittedValue = fitFieldText(fullValue, maxWidth - FIELD_TEXT_GAP - keyWidth);
  return { key: fittedKey, keyWidth, value: fittedValue };
};

const drawCollapseToggle = (
  x: number,
  y: number,
  collapsed: boolean,
  theme: IRenderTheme,
  onToggle: () => void,
): Container => {
  const toggle = new Container();
  toggle.position.set(x, y);
  toggle.eventMode = 'static';
  toggle.cursor = 'pointer';
  toggle.hitArea = { contains: (localX, localY) => localX >= 0 && localX <= 20 && localY >= 0 && localY <= 20 };
  toggle.addChild(
    new Graphics().roundRect(0, 0, 20, 20, 4).fill(theme.node).stroke({ color: theme.nodeBorder, width: 1 }),
  );
  const icon = new Graphics().moveTo(5, 10).lineTo(15, 10);
  if (collapsed) icon.moveTo(10, 5).lineTo(10, 15);
  icon.stroke({ color: theme.text, width: 2 });
  toggle.addChild(icon);
  toggle.on('pointertap', (event: FederatedPointerEvent) => {
    event.stopPropagation();
    onToggle();
  });
  return toggle;
};

const getViewportBounds = (
  transform: IViewportTransform,
  screenWidth: number,
  screenHeight: number,
): IViewportBounds => ({
  left: (-transform.x - VIEW_PADDING) / transform.scale,
  top: (-transform.y - VIEW_PADDING) / transform.scale,
  right: (screenWidth - transform.x + VIEW_PADDING) / transform.scale,
  bottom: (screenHeight - transform.y + VIEW_PADDING) / transform.scale,
});

const intersectsViewport = (node: IGraphNode, bounds: IViewportBounds): boolean => {
  const height = node.height ?? getNodeHeight(node);

  return (
    node.position.x + NODE_WIDTH >= bounds.left &&
    node.position.x <= bounds.right &&
    node.position.y + height >= bounds.top &&
    node.position.y <= bounds.bottom
  );
};

const sectionIntersectsViewport = (section: { x: number; y: number }[], bounds: IViewportBounds): boolean => {
  for (let index = 1; index < section.length; index += 1) {
    const start = section[index - 1];
    const end = section[index];
    if (start != null && end != null) {
      const left = Math.min(start.x, end.x);
      const right = Math.max(start.x, end.x);
      const top = Math.min(start.y, end.y);
      const bottom = Math.max(start.y, end.y);
      if (right >= bounds.left && left <= bounds.right && bottom >= bounds.top && top <= bounds.bottom) return true;
    }
  }
  return false;
};

const getSectionCenter = (section: { x: number; y: number }[]): { x: number; y: number } | undefined => {
  const segmentIndex = Math.max(0, Math.floor((section.length - 1) / 2));
  const start = section[segmentIndex];
  const end = section[segmentIndex + 1];
  if (start == null || end == null) return undefined;
  return { x: (start.x + end.x) / 2, y: (start.y + end.y) / 2 };
};

const drawNode = (
  node: IGraphNode,
  theme: IRenderTheme,
  ports: ReadonlyMap<string, ILayoutPort>,
  bounds: IViewportBounds,
  textResolution: number,
  onClick: (node: IGraphNode) => void,
  onToggleBranch: (childId: string) => void,
  onToggleNode: (node: IGraphNode) => void,
  registerStroke: (update: (color: number) => void) => void,
  collapsedBranchIds: ReadonlySet<string>,
  searchMatch?: IGraphSearchMatch,
): Container => {
  const container = new Container();
  const height = node.height ?? getNodeHeight(node);
  container.position.set(node.position.x, node.position.y);
  container.eventMode = 'static';
  container.cursor = 'pointer';
  container.hitArea = { contains: (x, y) => x >= 0 && x <= NODE_WIDTH && y >= 0 && y <= height };
  container.on('pointertap', (event: FederatedPointerEvent) => {
    event.stopPropagation();
    onClick(node);
  });

  const background = new Graphics()
    .roundRect(0, 0, NODE_WIDTH, height, 6)
    .fill(theme.node)
    .stroke({ color: searchMatch == null ? theme.nodeBorder : theme.nodeSearched, width: searchMatch == null ? 2 : 3 });
  container.addChild(background);
  registerStroke((color) => {
    background
      .clear()
      .roundRect(0, 0, NODE_WIDTH, height, 6)
      .fill(theme.node)
      .stroke({ color, width: searchMatch == null ? 2 : 3 });
  });
  const rowHighlights = new Graphics();
  container.addChild(rowHighlights);
  const searchRowColor = adjustColor(theme.node, theme.searchTextAdjustment, 0.05);

  const localTop = bounds.top - node.position.y;
  const localBottom = bounds.bottom - node.position.y;
  if (localTop <= HEADER_HEIGHT && localBottom >= 0) {
    const childIds = getDirectChildIds(node);
    const hasChildren = childIds.length > 0;
    const allChildrenCollapsed = hasChildren && childIds.every((id) => collapsedBranchIds.has(id));
    if (hasChildren) {
      container.addChild(drawCollapseToggle(10, 10, allChildrenCollapsed, theme, () => onToggleNode(node)));
    }
    const heading = new Text({
      text: truncate(node.data.label, hasChildren ? 30 : 34),
      resolution: textResolution,
      roundPixels: true,
      style: {
        fontFamily: 'sans-serif',
        fontSize: 15,
        lineHeight: HEADING_LINE_HEIGHT,
        fill: searchMatch?.heading ? adjustSearchColor(theme.heading, theme.searchTextAdjustment) : theme.heading,
        fontWeight: searchMatch?.heading ? '700' : '600',
      },
    });
    heading.position.set(hasChildren ? 40 : 12, 10);
    container.addChild(heading);
  }

  const fieldCount = node.data.primitiveFields.length + node.data.complexFields.length;
  const firstField = Math.max(0, Math.floor((localTop - HEADER_HEIGHT) / LINE_HEIGHT) - 1);
  const lastField = Math.min(fieldCount - 1, Math.ceil((localBottom - HEADER_HEIGHT) / LINE_HEIGHT) + 1);
  const firstPrimitive = Math.min(firstField, node.data.primitiveFields.length);
  const lastPrimitive = Math.min(lastField, node.data.primitiveFields.length - 1);
  const separators = new Graphics();
  for (let index = firstPrimitive; index <= lastPrimitive; index += 1) {
    const field = node.data.primitiveFields[index];
    if (field != null) {
      const rowY = HEADER_HEIGHT + index * LINE_HEIGHT;
      const fieldText = getFieldTextLayout(field.key, field.value);
      const color = getTypeColor(theme, field.type);
      const fieldMatch = searchMatch?.primitiveFields[index];
      if (fieldMatch?.key === true || fieldMatch?.value === true) {
        const highlightHeight = index === fieldCount - 1 ? LINE_HEIGHT - 2 : LINE_HEIGHT;
        rowHighlights.rect(2, rowY, NODE_WIDTH - 4, highlightHeight).fill(searchRowColor);
      }
      container.addChild(new Graphics().circle(15, rowY + LINE_HEIGHT / 2, 3).fill(color));
      const keyText = new Text({
        text: fieldText.key,
        resolution: textResolution,
        roundPixels: true,
        style: {
          fontFamily: MONOSPACE_FONT,
          fontSize: 12,
          lineHeight: TEXT_LINE_HEIGHT,
          fill: fieldMatch?.key ? adjustSearchColor(theme.text, theme.searchTextAdjustment) : theme.text,
          fontWeight: fieldMatch?.key ? '700' : '400',
        },
      });
      keyText.position.set(FIELD_TEXT_X, rowY + TEXT_ROW_OFFSET);
      container.addChild(keyText);
      const valueText = new Text({
        text: fieldText.value,
        resolution: textResolution,
        roundPixels: true,
        style: {
          fontFamily: MONOSPACE_FONT,
          fontSize: 12,
          lineHeight: TEXT_LINE_HEIGHT,
          fill: fieldMatch?.value ? adjustSearchColor(color, theme.searchTextAdjustment) : color,
          fontWeight: fieldMatch?.value ? '700' : '400',
        },
      });
      valueText.position.set(FIELD_TEXT_X + fieldText.keyWidth + FIELD_TEXT_GAP, rowY + TEXT_ROW_OFFSET);
      container.addChild(valueText);
      if (index < fieldCount - 1) separators.moveTo(0, rowY + LINE_HEIGHT).lineTo(NODE_WIDTH, rowY + LINE_HEIGHT);
    }
  }

  const primitiveCount = node.data.primitiveFields.length;
  const firstComplex = Math.max(0, firstField - primitiveCount);
  const lastComplex = Math.min(node.data.complexFields.length - 1, lastField - primitiveCount);
  for (let index = firstComplex; index <= lastComplex; index += 1) {
    const field = node.data.complexFields[index];
    if (field != null) {
      const collapsed = collapsedBranchIds.has(field.nodeId);
      const unit = field.type === 'array' ? 'items' : 'keys';
      let size = `… ${field.size} ${unit}`;
      if (!collapsed) size = field.type === 'array' ? `[${field.size} ${unit}]` : `{${field.size} ${unit}}`;
      const rowY = HEADER_HEIGHT + (primitiveCount + index) * LINE_HEIGHT;
      const fieldText = getFieldTextLayout(field.key, size, COLLAPSIBLE_FIELD_TEXT_WIDTH);
      const color = getTypeColor(theme, field.type);
      const fieldMatch = searchMatch?.complexFields[index];
      if (fieldMatch?.key === true || fieldMatch?.value === true) {
        const highlightHeight = primitiveCount + index === fieldCount - 1 ? LINE_HEIGHT - 2 : LINE_HEIGHT;
        rowHighlights.rect(2, rowY, NODE_WIDTH - 4, highlightHeight).fill(searchRowColor);
      }
      container.addChild(
        drawCollapseToggle(8, rowY + (LINE_HEIGHT - 20) / 2, collapsed, theme, () => onToggleBranch(field.nodeId)),
      );
      const keyText = new Text({
        text: fieldText.key,
        resolution: textResolution,
        roundPixels: true,
        style: {
          fontFamily: MONOSPACE_FONT,
          fontSize: 12,
          lineHeight: TEXT_LINE_HEIGHT,
          fill: fieldMatch?.key ? adjustSearchColor(theme.complexText, theme.searchTextAdjustment) : theme.complexText,
          fontWeight: fieldMatch?.key ? '700' : '400',
          fontStyle: collapsed ? 'italic' : 'normal',
        },
      });
      keyText.alpha = collapsed ? 0.7 : 1;
      keyText.position.set(COLLAPSIBLE_FIELD_TEXT_X, rowY + TEXT_ROW_OFFSET);
      container.addChild(keyText);
      const valueText = new Text({
        text: fieldText.value,
        resolution: textResolution,
        roundPixels: true,
        style: {
          fontFamily: MONOSPACE_FONT,
          fontSize: 12,
          lineHeight: TEXT_LINE_HEIGHT,
          fill: fieldMatch?.value ? adjustSearchColor(color, theme.searchTextAdjustment) : color,
          fontWeight: fieldMatch?.value ? '700' : '400',
          fontStyle: collapsed ? 'italic' : 'normal',
        },
      });
      valueText.alpha = collapsed ? 0.7 : 1;
      valueText.position.set(COLLAPSIBLE_FIELD_TEXT_X + fieldText.keyWidth + FIELD_TEXT_GAP, rowY + TEXT_ROW_OFFSET);
      container.addChild(valueText);
      const port = ports.get(getSourcePortId(node.id, field.key));
      if (!collapsed && port != null)
        container.addChild(new Graphics().circle(port.position.x, port.position.y, 5).fill(color));
      if (primitiveCount + index < fieldCount - 1)
        separators.moveTo(0, rowY + LINE_HEIGHT).lineTo(NODE_WIDTH, rowY + LINE_HEIGHT);
    }
  }
  separators.stroke({ color: theme.nodeBorder, width: 1 });
  container.addChild(separators);

  // eslint-disable-next-line no-underscore-dangle
  if (node.data._parent != null) {
    const color = getTypeColor(theme, node.data.nodeType);
    const port = ports.get(getTargetPortId(node.id));
    if (port != null) container.addChild(new Graphics().circle(port.position.x, port.position.y, 5).fill(color));
  }

  return container;
};

export const PixiGraphRenderer = () => {
  const hostRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<Application | null>(null);
  const worldRef = useRef<Container | null>(null);
  const layoutRef = useRef<IElkLayoutResult | null>(null);
  const transformRef = useRef<IViewportTransform>({ x: 40, y: 40, scale: 1 });
  const renderRef = useRef<() => void>(() => undefined);
  const [layout, setLayout] = useState<IElkLayoutResult | null>(null);
  const [isLayouting, setIsLayouting] = useState(false);
  const [layoutError, setLayoutError] = useState<string | null>(null);
  const trackerRef = useRef(false);
  const trackedRef = useRef(new Set<string>());
  const hoveredRef = useRef<{ node?: string; edge?: string }>({});
  const pointerRef = useRef<{ x: number; y: number } | null>(null);
  const draggedRef = useRef(false);
  const updateHoverRef = useRef<() => void>(() => undefined);
  const updateStrokesRef = useRef<() => void>(() => undefined);
  const [tracker, setTracker] = useState(false);
  const [selectedNode, setSelectedNode] = useState<IGraphNode | null>(null);
  const [collapsedBranchIds, setCollapsedBranchIds] = useState<Set<string>>(() => new Set());
  const pendingFocusRef = useRef<IGraphNode | null>(null);
  const { nodes, edges, direction, locMap, searchMatches, setDirection } = useGraphStore();
  const { editorInstance } = useEditorStore();
  const { theme } = useThemeStore();
  const visibleGraph = useMemo(
    () => getVisibleGraph(nodes, edges, collapsedBranchIds),
    [collapsedBranchIds, edges, nodes],
  );
  const graphFullyCollapsed = isGraphFullyCollapsed(nodes, collapsedBranchIds);
  const hasCollapsibleBranches = edges.length > 0;

  const toggleBranch = useCallback((childId: string) => {
    if (draggedRef.current) return;
    setCollapsedBranchIds((current) => toggleCollapsedBranch(current, childId));
  }, []);

  const toggleNode = useCallback((node: IGraphNode) => {
    if (draggedRef.current) return;
    setCollapsedBranchIds((current) => toggleCollapsedNode(current, node));
  }, []);

  const toggleAllBranches = useCallback(() => {
    if (graphFullyCollapsed) {
      setCollapsedBranchIds(new Set());
      return;
    }

    // eslint-disable-next-line no-underscore-dangle
    pendingFocusRef.current = nodes.find((node) => node.data._parent == null) ?? null;
    setCollapsedBranchIds(collapseAllBranches(nodes));
  }, [graphFullyCollapsed, nodes]);

  const revealNodes = useCallback((targets: IGraphNode[]) => {
    setCollapsedBranchIds((current) => {
      const next = revealNodeBranches(current, targets);
      return next.size === current.size ? current : next;
    });
  }, []);

  const toggleTracker = () => {
    const next = toggleTrackerMode({ enabled: trackerRef.current, selected: trackedRef.current });
    trackerRef.current = next.enabled;
    setTracker(next.enabled);
    trackedRef.current = new Set(next.selected);
    setSelectedNode(null);
    updateStrokesRef.current();
  };

  const clickNode = useCallback((node: IGraphNode) => {
    if (draggedRef.current) return;
    if (trackerRef.current) {
      trackedRef.current = toggleTrackedNode(trackedRef.current, node.id);
      updateStrokesRef.current();
    } else setSelectedNode(node);
  }, []);

  const zoom = (factor: number) => {
    const app = appRef.current;
    if (app == null) return;
    const previous = transformRef.current;
    const scale = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, previous.scale * factor));
    transformRef.current = {
      x: app.screen.width / 2 - ((app.screen.width / 2 - previous.x) * scale) / previous.scale,
      y: app.screen.height / 2 - ((app.screen.height / 2 - previous.y) * scale) / previous.scale,
      scale,
    };
    renderRef.current();
  };

  const fitView = () => {
    const app = appRef.current;
    const { current } = layoutRef;
    if (app == null || current == null) return;
    transformRef.current = fitGraphViewport(
      current.bounds.width,
      current.bounds.height,
      app.screen.width,
      app.screen.height,
    );
    renderRef.current();
  };

  useEffect(() => {
    trackedRef.current = new Set();
    hoveredRef.current = {};
    pendingFocusRef.current = null;
    setSelectedNode(null);
    updateStrokesRef.current();
  }, [edges]);

  useEffect(() => {
    setCollapsedBranchIds(new Set());
  }, [nodes]);

  const findNodeInEditor = useCallback(
    (node: IGraphNode) => {
      const entry = locMap[node.id];
      if (editorInstance == null) return;
      const selection =
        node.id === '$' || entry == null
          ? { startLineNumber: 1, startColumn: 1, endLineNumber: 1, endColumn: 1 }
          : {
              startLineNumber: entry.loc.start.line,
              startColumn: entry.loc.start.column,
              endLineNumber: entry.loc.end.line,
              endColumn: entry.loc.end.column,
            };
      setSelectedNode(null);
      setTimeout(() => {
        editorInstance.setSelection(selection);
        editorInstance.revealLineInCenter(selection.startLineNumber);
        editorInstance.focus();
      }, 100);
    },
    [editorInstance, locMap],
  );

  const focusLayoutNode = useCallback((node: IGraphNode, currentLayout: IElkLayoutResult | null): boolean => {
    const app = appRef.current;
    const layoutedNode = currentLayout?.nodes.find((candidate) => candidate.id === node.id);
    if (app == null || layoutedNode == null) return false;
    const scale = Math.max(transformRef.current.scale, 0.8);
    transformRef.current = {
      x: app.screen.width / 2 - (layoutedNode.position.x + NODE_WIDTH / 2) * scale,
      y: app.screen.height / 2 - (layoutedNode.position.y + getNodeHeight(layoutedNode) / 2) * scale,
      scale,
    };
    renderRef.current();
    return true;
  }, []);

  const focusNode = useCallback(
    (node: IGraphNode) => {
      if (focusLayoutNode(node, layoutRef.current)) return;
      pendingFocusRef.current = node;
      setCollapsedBranchIds((current) => {
        const next = revealNodeBranches(current, [node]);
        return next.size === current.size ? current : next;
      });
    },
    [focusLayoutNode],
  );

  useEffect(() => {
    if (visibleGraph.nodes.length === 0) {
      setLayout(null);
      layoutRef.current = null;
      return undefined;
    }
    setIsLayouting(true);
    setLayoutError(null);
    let active = true;
    const task = applyGraphLayout(visibleGraph.nodes, visibleGraph.edges, direction === 'LR' ? 'LR' : 'TB');
    task.promise
      .then((result) => {
        if (!active) return;
        layoutRef.current = result;
        setLayout(result);
        const pendingFocus = pendingFocusRef.current;
        if (pendingFocus != null && focusLayoutNode(pendingFocus, result)) pendingFocusRef.current = null;
      })
      .catch((error: unknown) => {
        if (active) setLayoutError(error instanceof Error ? error.message : String(error));
      })
      .finally(() => {
        if (active) setIsLayouting(false);
      });
    return () => {
      active = false;
      task.cancel();
    };
  }, [direction, focusLayoutNode, visibleGraph]);

  useEffect(() => {
    const host = hostRef.current;
    if (host == null) return undefined;
    let active = true;
    let dragging = false;
    let lastX = 0;
    let lastY = 0;
    let startX = 0;
    let startY = 0;
    let renderTimer: ReturnType<typeof setTimeout> | undefined;
    const app = new Application();
    let resizeObserver: ResizeObserver | undefined;

    const initialize = async () => {
      await app.init({
        resizeTo: host,
        backgroundColor: themes[theme].background,
        antialias: true,
        resolution: Math.min(window.devicePixelRatio, 2),
        autoDensity: true,
      });
      if (!active) {
        app.destroy(true, { children: true });
        return;
      }
      host.appendChild(app.canvas);
      const world = new Container();
      app.stage.addChild(world);
      appRef.current = app;
      worldRef.current = world;

      const scheduleRender = () => {
        clearTimeout(renderTimer);
        renderTimer = setTimeout(() => renderRef.current(), 80);
      };
      resizeObserver = new ResizeObserver(scheduleRender);
      resizeObserver.observe(host);
      app.canvas.addEventListener(
        'wheel',
        (event) => {
          event.preventDefault();
          const rect = app.canvas.getBoundingClientRect();
          const mouseX = event.clientX - rect.left;
          const mouseY = event.clientY - rect.top;
          pointerRef.current = { x: mouseX, y: mouseY };
          transformRef.current = applyWheelTransform(
            transformRef.current,
            event,
            pointerRef.current,
            app.screen.height,
          );
          world.position.set(transformRef.current.x, transformRef.current.y);
          world.scale.set(transformRef.current.scale);
          updateHoverRef.current();
          scheduleRender();
        },
        { passive: false },
      );
      app.canvas.addEventListener('pointerdown', (event) => {
        if (event.button !== 0) return;
        dragging = true;
        draggedRef.current = false;
        startX = event.clientX;
        startY = event.clientY;
        lastX = event.clientX;
        lastY = event.clientY;
        app.canvas.setPointerCapture(event.pointerId);
      });
      app.canvas.addEventListener('pointermove', (event) => {
        const rect = app.canvas.getBoundingClientRect();
        pointerRef.current = { x: event.clientX - rect.left, y: event.clientY - rect.top };
        if (!dragging) {
          updateHoverRef.current();
          return;
        }
        if (Math.hypot(event.clientX - startX, event.clientY - startY) > 4) draggedRef.current = true;
        if (!draggedRef.current) return;
        hoveredRef.current = {};
        updateStrokesRef.current();
        transformRef.current.x += event.clientX - lastX;
        transformRef.current.y += event.clientY - lastY;
        lastX = event.clientX;
        lastY = event.clientY;
        world.position.set(transformRef.current.x, transformRef.current.y);
        scheduleRender();
      });
      app.canvas.addEventListener('pointerleave', () => {
        pointerRef.current = null;
        hoveredRef.current = {};
        updateStrokesRef.current();
      });
      app.canvas.addEventListener('pointercancel', () => {
        dragging = false;
        draggedRef.current = true;
        pointerRef.current = null;
        hoveredRef.current = {};
        updateStrokesRef.current();
      });
      app.canvas.addEventListener('pointerup', () => {
        dragging = false;
        scheduleRender();
      });
      renderRef.current();
    };
    initialize().catch(() => undefined);

    return () => {
      active = false;
      clearTimeout(renderTimer);
      resizeObserver?.disconnect();
      appRef.current = null;
      worldRef.current = null;
      updateStrokesRef.current = () => undefined;
      updateHoverRef.current = () => undefined;
      if (app.canvas.parentNode != null) app.destroy(true, { children: true });
    };
    // Theme changes are applied without recreating the WebGL application.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    renderRef.current = () => {
      const app = appRef.current;
      const world = worldRef.current;
      const currentLayout = layoutRef.current;
      if (app == null || world == null) return;
      const renderTheme = themes[theme];
      app.renderer.background.color = renderTheme.background;
      world.removeChildren().forEach((child) => child.destroy({ children: true }));
      updateStrokesRef.current = () => undefined;
      updateHoverRef.current = () => undefined;
      if (currentLayout == null) return;
      const transform = transformRef.current;
      const viewportBounds = getViewportBounds(transform, app.screen.width, app.screen.height);
      const textResolution = Math.min(Math.max(app.renderer.resolution, app.renderer.resolution * transform.scale), 3);
      world.position.set(transform.x, transform.y);
      world.scale.set(transform.scale);
      const currentNodes = new Map(nodes.map((node) => [node.id, node]));
      const visibleNodes = currentLayout.nodes
        .filter((node) => intersectsViewport(node, viewportBounds))
        .map((node) => {
          const current = currentNodes.get(node.id);
          return current == null ? node : { ...node, data: current.data };
        });
      const strokeUpdates: (() => void)[] = [];
      const edgeLayer = new Container();
      const edgeLabels = new Container();
      const graphEdges = new Map(visibleGraph.edges.map((edge) => [edge.id, edge]));
      const layoutPorts = new Map(currentLayout.ports.map((port) => [port.id, port]));
      const visibleLayoutEdges: { id: string; sections: { x: number; y: number }[][] }[] = [];
      for (const edge of currentLayout.edges) {
        const visibleSections = edge.sections.filter((section) => sectionIntersectsViewport(section, viewportBounds));
        // eslint-disable-next-line no-continue
        if (visibleSections.length === 0) continue;
        visibleLayoutEdges.push({ id: edge.id, sections: visibleSections });
        const edgeGraphics = new Graphics();
        edgeLayer.addChild(edgeGraphics);
        let labelDrawn = false;
        for (const section of visibleSections) {
          const first = section[0];
          if (first != null) {
            edgeGraphics.moveTo(first.x, first.y);
            for (const point of section.slice(1)) edgeGraphics.lineTo(point.x, point.y);
          }
          const graphEdge = graphEdges.get(edge.id);
          const center = getSectionCenter(section);
          if (!labelDrawn && graphEdge != null && center != null) {
            const label = new Text({
              text: truncate(singleLine(graphEdge.label), 24),
              resolution: textResolution,
              roundPixels: true,
              style: {
                fontFamily: 'sans-serif',
                fontSize: 12,
                lineHeight: TEXT_LINE_HEIGHT,
                fill: renderTheme.heading,
                stroke: { color: renderTheme.background, width: 5 },
              },
            });
            label.anchor.set(0.5);
            label.position.set(center.x, center.y);
            edgeLabels.addChild(label);
            labelDrawn = true;
          }
        }
        let previousColor: number | undefined;
        strokeUpdates.push(() => {
          const graphEdge = graphEdges.get(edge.id);
          const tracked = graphEdge != null && isTrackedEdge(trackedRef.current, graphEdge.source, graphEdge.target);
          const state = getStrokeState(hoveredRef.current.edge === edge.id, tracked);
          const color = {
            hover: renderTheme.hover,
            tracker: renderTheme.tracker,
            search: renderTheme.edge,
            default: renderTheme.edge,
          }[state];
          if (color === previousColor) return;
          previousColor = color;
          edgeGraphics.clear();
          for (const section of visibleSections) {
            const first = section[0];
            if (first != null) {
              edgeGraphics.moveTo(first.x, first.y);
              for (const point of section.slice(1)) edgeGraphics.lineTo(point.x, point.y);
            }
          }
          edgeGraphics.stroke({ color, width: 2 / transform.scale });
        });
      }
      world.addChild(edgeLayer);
      world.addChild(edgeLabels);
      for (const node of visibleNodes) {
        world.addChild(
          drawNode(
            node,
            renderTheme,
            layoutPorts,
            viewportBounds,
            textResolution,
            clickNode,
            toggleBranch,
            toggleNode,
            (update) => {
              let previousColor: number | undefined;
              strokeUpdates.push(() => {
                const state = getStrokeState(
                  hoveredRef.current.node === node.id,
                  trackedRef.current.has(node.id),
                  searchMatches[node.id] != null,
                );
                const color = {
                  hover: renderTheme.hover,
                  tracker: renderTheme.tracker,
                  search: renderTheme.nodeSearched,
                  default: renderTheme.nodeBorder,
                }[state];
                if (color !== previousColor) {
                  previousColor = color;
                  update(color);
                }
              });
            },
            collapsedBranchIds,
            searchMatches[node.id],
          ),
        );
      }
      updateStrokesRef.current = () => {
        strokeUpdates.forEach((update) => update());
        app.render();
      };
      updateHoverRef.current = () => {
        const pointer = pointerRef.current;
        const currentTransform = transformRef.current;
        const point =
          pointer == null
            ? null
            : {
                x: (pointer.x - currentTransform.x) / currentTransform.scale,
                y: (pointer.y - currentTransform.y) / currentTransform.scale,
              };
        const node =
          point == null
            ? undefined
            : visibleNodes.find(
                (candidate) =>
                  point.x >= candidate.position.x &&
                  point.x <= candidate.position.x + NODE_WIDTH &&
                  point.y >= candidate.position.y &&
                  point.y <= candidate.position.y + getNodeHeight(candidate),
              );
        let edgeId: string | undefined;
        let nearest = 6 / currentTransform.scale;
        if (point != null && node == null) {
          for (const edge of visibleLayoutEdges) {
            for (const section of edge.sections) {
              for (let index = 1; index < section.length; index += 1) {
                const distance = distanceToSegment(point, section[index - 1], section[index]);
                if (distance <= nearest) {
                  nearest = distance;
                  edgeId = edge.id;
                }
              }
            }
          }
        }
        hoveredRef.current = { node: node?.id, edge: edgeId };
        updateStrokesRef.current();
      };
      updateHoverRef.current();
    };
    renderRef.current();
  }, [
    clickNode,
    collapsedBranchIds,
    direction,
    layout,
    nodes,
    searchMatches,
    theme,
    toggleBranch,
    toggleNode,
    visibleGraph.edges,
  ]);

  return (
    <div className="relative w-full h-full overflow-hidden bg-background">
      <div ref={hostRef} className="absolute inset-0" />
      <PixiSearchPanel
        direction={direction}
        graphFullyCollapsed={graphFullyCollapsed}
        hasCollapsibleBranches={hasCollapsibleBranches}
        onFitView={fitView}
        onFocusNode={focusNode}
        onRevealNodes={revealNodes}
        onToggleAllBranches={toggleAllBranches}
        onToggleDirection={() => setDirection(direction === 'LR' ? 'TB' : 'LR')}
        onToggleTracker={toggleTracker}
        onZoomIn={() => zoom(1.2)}
        onZoomOut={() => zoom(1 / 1.2)}
        tracker={tracker}
      />
      {Boolean(isLayouting) && (
        <div className="absolute inset-0 z-20 grid place-items-center bg-background/70 pointer-events-none">
          <div className="rounded-md border bg-card px-5 py-3 text-sm shadow-lg">
            ELK layout: {nodes.length.toLocaleString()} nodes / {edges.length.toLocaleString()} edges
          </div>
        </div>
      )}
      {Boolean(layoutError) && (
        <div className="absolute top-14 right-3 z-20 max-w-sm rounded-md border border-destructive bg-card p-3 text-sm text-destructive">
          ELK layout failed: {layoutError}
        </div>
      )}
      <PixiNodeDetailsDialog
        node={selectedNode}
        onClose={() => setSelectedNode(null)}
        onFindInEditor={findNodeInEditor}
      />
    </div>
  );
};

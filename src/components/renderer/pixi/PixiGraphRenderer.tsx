import { useCallback, useEffect, useRef, useState } from 'react';

import { Application, Container, Graphics, Text } from 'pixi.js';

import { PixiSearchPanel } from '#/components/renderer/pixi/PixiSearchPanel';
import { Button } from '#/components/ui/button';
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

import type { IGraphNode } from '#/lib/graph/interfaces/IGraphNode';
import type { IElkLayoutResult, ILayoutPort } from '#/lib/layout/interfaces/IElkLayoutResult';

const MIN_ZOOM = 0.08;
const MAX_ZOOM = 3;
const VIEW_PADDING = 300;
const TEXT_MAX_LENGTH = 36;
const MONOSPACE_FONT = 'SFMono-Regular, Consolas, Liberation Mono, Menlo, monospace';

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
  heading: number;
  text: number;
  complexText: number;
  edge: number;
  objectHandle: number;
  arrayHandle: number;
}

const themes: Record<'light' | 'dark', IRenderTheme> = {
  light: {
    background: 0xffffff,
    node: 0xffffff,
    nodeBorder: 0xd4d4d8,
    nodeSearched: 0x3b82f6,
    heading: 0x18181b,
    text: 0x52525b,
    complexText: 0x2563eb,
    edge: 0x94a3b8,
    objectHandle: 0x3b82f6,
    arrayHandle: 0xf59e0b,
  },
  dark: {
    background: 0x09090b,
    node: 0x18181b,
    nodeBorder: 0x3f3f46,
    nodeSearched: 0x60a5fa,
    heading: 0xf4f4f5,
    text: 0xd4d4d8,
    complexText: 0x7dd3fc,
    edge: 0x71717a,
    objectHandle: 0x60a5fa,
    arrayHandle: 0xfbbf24,
  },
};

const truncate = (value: string, length = 32): string =>
  value.length > length ? `${value.slice(0, length - 1)}…` : value;

const singleLine = (value: unknown): string =>
  String(value).replaceAll('\r', '\\r').replaceAll('\n', '\\n').replaceAll('\t', '\\t');

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

const drawNode = (
  node: IGraphNode,
  theme: IRenderTheme,
  ports: ReadonlyMap<string, ILayoutPort>,
  bounds: IViewportBounds,
  textResolution: number,
  onClick: (node: IGraphNode) => void,
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
    .stroke({ color: node.data.searched ? theme.nodeSearched : theme.nodeBorder, width: node.data.searched ? 3 : 2 });
  container.addChild(background);

  const localTop = bounds.top - node.position.y;
  const localBottom = bounds.bottom - node.position.y;
  if (localTop <= HEADER_HEIGHT && localBottom >= 0) {
    const heading = new Text({
      text: truncate(node.data.label, 34),
      resolution: textResolution,
      roundPixels: true,
      style: { fontFamily: 'sans-serif', fontSize: 15, fill: theme.heading, fontWeight: '600' },
    });
    heading.position.set(12, 10);
    container.addChild(heading);
  }

  const fieldCount = node.data.primitiveFields.length + node.data.complexFields.length;
  const firstField = Math.max(0, Math.floor((localTop - HEADER_HEIGHT) / LINE_HEIGHT) - 1);
  const lastField = Math.min(fieldCount - 1, Math.ceil((localBottom - HEADER_HEIGHT) / LINE_HEIGHT) + 1);
  const firstPrimitive = Math.min(firstField, node.data.primitiveFields.length);
  const lastPrimitive = Math.min(lastField, node.data.primitiveFields.length - 1);
  for (let index = firstPrimitive; index <= lastPrimitive; index += 1) {
    const field = node.data.primitiveFields[index];
    if (field != null) {
      const text = new Text({
        text: truncate(`${singleLine(field.key)}: ${singleLine(field.value)}`, TEXT_MAX_LENGTH),
        resolution: textResolution,
        roundPixels: true,
        style: { fontFamily: MONOSPACE_FONT, fontSize: 12, fill: theme.text },
      });
      text.position.set(12, HEADER_HEIGHT + index * LINE_HEIGHT);
      container.addChild(text);
    }
  }

  const primitiveCount = node.data.primitiveFields.length;
  const firstComplex = Math.max(0, firstField - primitiveCount);
  const lastComplex = Math.min(node.data.complexFields.length - 1, lastField - primitiveCount);
  for (let index = firstComplex; index <= lastComplex; index += 1) {
    const field = node.data.complexFields[index];
    if (field != null) {
      const size = field.type === 'array' ? `[${field.size}]` : `{${field.size}}`;
      const text = new Text({
        text: truncate(`${singleLine(field.key)}: ${size}`, TEXT_MAX_LENGTH),
        resolution: textResolution,
        roundPixels: true,
        style: { fontFamily: MONOSPACE_FONT, fontSize: 12, fill: theme.complexText },
      });
      text.position.set(12, HEADER_HEIGHT + (primitiveCount + index) * LINE_HEIGHT);
      container.addChild(text);
      const handleColor = field.type === 'array' ? theme.arrayHandle : theme.objectHandle;
      const port = ports.get(getSourcePortId(node.id, field.key));
      if (port != null)
        container.addChild(new Graphics().circle(port.position.x, port.position.y, 5).fill(handleColor));
    }
  }

  // eslint-disable-next-line no-underscore-dangle
  if (node.data._parent != null) {
    // eslint-disable-next-line no-underscore-dangle
    const color = node.data._parent.data.nodeType === 'array' ? theme.arrayHandle : theme.objectHandle;
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
  const { nodes, edges, direction, locMap, setDirection } = useGraphStore();
  const { editorInstance } = useEditorStore();
  const { theme } = useThemeStore();

  const selectNodeInEditor = useCallback(
    (node: IGraphNode) => {
      const entry = locMap[node.id];
      if (editorInstance == null || entry == null) return;
      editorInstance.setSelection({
        startLineNumber: entry.loc.start.line,
        startColumn: entry.loc.start.column,
        endLineNumber: entry.loc.end.line,
        endColumn: entry.loc.end.column,
      });
      editorInstance.revealLineInCenter(entry.loc.start.line);
      editorInstance.focus();
    },
    [editorInstance, locMap],
  );

  const focusNode = useCallback((node: IGraphNode) => {
    const app = appRef.current;
    const layoutedNode = layoutRef.current?.nodes.find((candidate) => candidate.id === node.id);
    if (app == null || layoutedNode == null) return;
    const scale = Math.max(transformRef.current.scale, 0.8);
    transformRef.current = {
      x: app.screen.width / 2 - (layoutedNode.position.x + NODE_WIDTH / 2) * scale,
      y: app.screen.height / 2 - (layoutedNode.position.y + getNodeHeight(layoutedNode) / 2) * scale,
      scale,
    };
    renderRef.current();
  }, []);

  useEffect(() => {
    if (nodes.length === 0) {
      setLayout(null);
      layoutRef.current = null;
      return undefined;
    }
    setIsLayouting(true);
    setLayoutError(null);
    const task = applyGraphLayout(nodes, edges, direction === 'LR' ? 'LR' : 'TB');
    task.promise
      .then((result) => {
        layoutRef.current = result;
        setLayout(result);
      })
      .catch((error: unknown) => setLayoutError(error instanceof Error ? error.message : String(error)))
      .finally(() => setIsLayouting(false));
    return () => task.cancel();
    // Search highlighting replaces node objects but does not change layout input.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [direction, edges, nodes.length, nodes[0]?.data.stringify]);

  useEffect(() => {
    const host = hostRef.current;
    if (host == null) return undefined;
    let active = true;
    let dragging = false;
    let lastX = 0;
    let lastY = 0;
    let renderTimer: ReturnType<typeof setTimeout> | undefined;
    const app = new Application();

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
      app.canvas.addEventListener(
        'wheel',
        (event) => {
          event.preventDefault();
          const rect = app.canvas.getBoundingClientRect();
          const mouseX = event.clientX - rect.left;
          const mouseY = event.clientY - rect.top;
          const previous = transformRef.current;
          const scale = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, previous.scale * Math.exp(-event.deltaY * 0.0015)));
          const worldX = (mouseX - previous.x) / previous.scale;
          const worldY = (mouseY - previous.y) / previous.scale;
          transformRef.current = { x: mouseX - worldX * scale, y: mouseY - worldY * scale, scale };
          world.position.set(transformRef.current.x, transformRef.current.y);
          world.scale.set(scale);
          scheduleRender();
        },
        { passive: false },
      );
      app.canvas.addEventListener('pointerdown', (event) => {
        dragging = true;
        lastX = event.clientX;
        lastY = event.clientY;
        app.canvas.setPointerCapture(event.pointerId);
      });
      app.canvas.addEventListener('pointermove', (event) => {
        if (!dragging) return;
        transformRef.current.x += event.clientX - lastX;
        transformRef.current.y += event.clientY - lastY;
        lastX = event.clientX;
        lastY = event.clientY;
        world.position.set(transformRef.current.x, transformRef.current.y);
        scheduleRender();
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
      appRef.current = null;
      worldRef.current = null;
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
      const edgeGraphics = new Graphics();
      const layoutPorts = new Map(currentLayout.ports.map((port) => [port.id, port]));
      for (const edge of currentLayout.edges) {
        for (const section of edge.sections) {
          if (sectionIntersectsViewport(section, viewportBounds)) {
            const first = section[0];
            if (first != null) {
              edgeGraphics.moveTo(first.x, first.y);
              for (const point of section.slice(1)) edgeGraphics.lineTo(point.x, point.y);
            }
          }
        }
      }
      edgeGraphics.stroke({ color: renderTheme.edge, width: 2 / transform.scale });
      world.addChild(edgeGraphics);
      for (const node of visibleNodes) {
        world.addChild(drawNode(node, renderTheme, layoutPorts, viewportBounds, textResolution, selectNodeInEditor));
      }
      app.render();
    };
    renderRef.current();
  }, [direction, edges, layout, nodes, selectNodeInEditor, theme]);

  return (
    <div className="relative w-full h-full overflow-hidden bg-background">
      <div ref={hostRef} className="absolute inset-0" />
      <div className="absolute top-3 right-3 z-10 flex gap-2">
        <Button onClick={() => setDirection(direction === 'LR' ? 'TB' : 'LR')} size="sm" variant="outline">
          {direction === 'LR' ? 'Left → Right' : 'Top → Bottom'}
        </Button>
      </div>
      <PixiSearchPanel onFocusNode={focusNode} />
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
    </div>
  );
};

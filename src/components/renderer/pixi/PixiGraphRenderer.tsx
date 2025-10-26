import { useEffect, useRef, useState } from 'react';

import { Application, Container, Graphics, Text } from 'pixi.js';

import { applyElkLayout } from '#/lib/layout/elkLayout';
import { useGraphStore } from '#/stores/graphStore';

import type { IGraphEdge } from '#/lib/graph/interfaces/IGraphEdge';
import type { IGraphNode } from '#/lib/graph/interfaces/IGraphNode';

export const PixiGraphRenderer = () => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<Application | null>(null);
  const isInitializedRef = useRef(false);
  const viewportRef = useRef<Container | null>(null);
  const { nodes, edges, direction, setDirection } = useGraphStore();
  const [layoutedNodes, setLayoutedNodes] = useState<IGraphNode[]>([]);

  // Apply ELK layout when nodes/edges/direction change
  useEffect(() => {
    if (nodes.length === 0) {
      setLayoutedNodes([]);
      return;
    }

    // Convert 'LR' to 'LR', but store uses 'LR' or 'TB' format
    const layoutDirection = direction === 'LR' ? 'LR' : 'TB';

    applyElkLayout(nodes, edges, layoutDirection)
      .then((layouted) => {
        setLayoutedNodes(layouted);
      })
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.error('ELK layout failed:', error);
        // Fallback to original nodes if layout fails
        setLayoutedNodes(nodes);
      });
  }, [nodes, edges, direction]);

  useEffect(() => {
    if (canvasRef.current == null) return;

    let mounted = true;
    let wheelHandler: ((event: WheelEvent) => void) | null = null;
    let isDragging = false;
    let dragStartX = 0;
    let dragStartY = 0;
    let viewportStartX = 0;
    let viewportStartY = 0;

    // Create PixiJS Application
    const app = new Application();

    // Initialize the application
    app
      .init({
        width: canvasRef.current.clientWidth || 800,
        height: canvasRef.current.clientHeight || 600,
        backgroundColor: 0x1a1a1a,
        antialias: true,
        resolution: window.devicePixelRatio || 1,
        autoDensity: true,
        autoStart: true,
      })
      .then(() => {
        if (!mounted || canvasRef.current == null) {
          app.destroy(true, { children: true, texture: true });
          return;
        }

        // Add canvas to DOM
        canvasRef.current.appendChild(app.canvas);
        appRef.current = app;
        isInitializedRef.current = true;

        // Create viewport container for zoom and pan
        const viewport = new Container();
        viewport.x = 0;
        viewport.y = 0;
        viewport.scale.set(1);
        app.stage.addChild(viewport);
        viewportRef.current = viewport;

        // Create containers for graph (edges first, then nodes for proper layering)
        const edgeContainer = new Container();
        const nodeContainer = new Container();
        viewport.addChild(edgeContainer);
        viewport.addChild(nodeContainer);

        // Render edges first (behind nodes)
        const edgeDirection = direction === 'LR' || direction === 'RL' ? 'LR' : 'TB';
        renderEdges(edgeContainer, edges, layoutedNodes, edgeDirection);

        // Render nodes on top
        renderNodes(nodeContainer, layoutedNodes);

        // Start the ticker to continuously render
        app.ticker.add(() => {
          // This will render every frame
          // PixiJS will automatically handle this, but we ensure it's running
        });

        // Add mouse wheel zoom functionality
        const { canvas } = app;
        wheelHandler = (event: WheelEvent) => {
          // Check if this is a pinch gesture (trackpad pinch on macOS)
          if (event.ctrlKey) {
            event.preventDefault();

            // Get mouse position relative to canvas
            const rect = canvas.getBoundingClientRect();
            const mouseX = event.clientX - rect.left;
            const mouseY = event.clientY - rect.top;

            // For pinch gesture, deltaY is the zoom amount
            // Negative deltaY = zoom in, Positive deltaY = zoom out
            // Increase sensitivity with higher multiplier
            const zoomFactor = 1 - event.deltaY * 0.02;
            const oldScale = viewport.scale.x;
            const newScale = oldScale * zoomFactor;

            console.log('Pinch zoom:', { oldScale, zoomFactor, newScale, deltaY: event.deltaY });

            // Limit zoom range (0.1x to 5x)
            if (newScale < 0.1 || newScale > 5) {
              console.log('Zoom limit reached:', newScale);
              return;
            }

            // Calculate new position to zoom towards mouse cursor
            const worldPosX = (mouseX - viewport.x) / viewport.scale.x;
            const worldPosY = (mouseY - viewport.y) / viewport.scale.y;

            viewport.scale.set(newScale);

            viewport.x = mouseX - worldPosX * newScale;
            viewport.y = mouseY - worldPosY * newScale;

            console.log('Viewport updated:', { scale: viewport.scale.x, x: viewport.x, y: viewport.y });
          } else {
            // Regular mouse wheel scroll - zoom
            event.preventDefault();

            // Get mouse position relative to canvas
            const rect = canvas.getBoundingClientRect();
            const mouseX = event.clientX - rect.left;
            const mouseY = event.clientY - rect.top;

            // Calculate zoom factor
            const zoomFactor = event.deltaY > 0 ? 0.9 : 1.1;
            const newScale = viewport.scale.x * zoomFactor;

            // Limit zoom range (0.1x to 5x)
            if (newScale < 0.1 || newScale > 5) return;

            // Calculate new position to zoom towards mouse cursor
            const worldPosX = (mouseX - viewport.x) / viewport.scale.x;
            const worldPosY = (mouseY - viewport.y) / viewport.scale.y;

            viewport.scale.set(newScale);

            viewport.x = mouseX - worldPosX * newScale;
            viewport.y = mouseY - worldPosY * newScale;
          }
        };

        canvas.addEventListener('wheel', wheelHandler, { passive: false });

        // Add mouse pan functionality
        const mouseDownHandler = (event: MouseEvent) => {
          isDragging = true;
          dragStartX = event.clientX;
          dragStartY = event.clientY;
          viewportStartX = viewport.x;
          viewportStartY = viewport.y;
          canvas.style.cursor = 'grabbing';
        };

        const mouseMoveHandler = (event: MouseEvent) => {
          if (!isDragging) return;

          const deltaX = event.clientX - dragStartX;
          const deltaY = event.clientY - dragStartY;

          viewport.x = viewportStartX + deltaX;
          viewport.y = viewportStartY + deltaY;
        };

        const mouseUpHandler = () => {
          isDragging = false;
          canvas.style.cursor = 'grab';
        };

        const mouseLeaveHandler = () => {
          isDragging = false;
          canvas.style.cursor = 'grab';
        };

        canvas.style.cursor = 'grab';
        canvas.addEventListener('mousedown', mouseDownHandler);
        canvas.addEventListener('mousemove', mouseMoveHandler);
        canvas.addEventListener('mouseup', mouseUpHandler);
        canvas.addEventListener('mouseleave', mouseLeaveHandler);
      })
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.error('PixiJS initialization failed:', error);
      });

    // Cleanup
    return () => {
      mounted = false;
      isInitializedRef.current = false;
      if (appRef.current) {
        const { canvas } = appRef.current;
        // Remove all event listeners
        if (wheelHandler) {
          canvas.removeEventListener('wheel', wheelHandler);
        }
        // Note: mousedown, mousemove, mouseup, mouseleave will be cleaned up
        // automatically when canvas is destroyed
        appRef.current.destroy(true, { children: true, texture: true });
        appRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-render when layouted nodes change
  useEffect(() => {
    if (!isInitializedRef.current || appRef.current == null || viewportRef.current == null) return;
    if (layoutedNodes.length === 0) return;

    try {
      // Clear viewport's children only, not the viewport itself
      viewportRef.current.removeChildren();

      // Recreate containers inside viewport
      const edgeContainer = new Container();
      const nodeContainer = new Container();
      viewportRef.current.addChild(edgeContainer);
      viewportRef.current.addChild(nodeContainer);

      // Re-render edges and nodes with layouted positions
      const edgeDirection = direction === 'LR' || direction === 'RL' ? 'LR' : 'TB';
      renderEdges(edgeContainer, edges, layoutedNodes, edgeDirection);
      renderNodes(nodeContainer, layoutedNodes);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error rendering graph:', error);
    }
  }, [layoutedNodes, edges, direction]);

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
      }}
    >
      {/* Canvas container */}
      <div
        ref={canvasRef}
        style={{
          width: '100%',
          height: '100%',
          position: 'absolute',
          top: 0,
          left: 0,
        }}
      />

      {/* Direction toggle button */}
      <div
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          zIndex: 10,
        }}
      >
        <button
          type="button"
          style={{
            padding: '8px 16px',
            backgroundColor: 'rgba(42, 42, 42, 0.9)',
            color: 'white',
            border: '2px solid #444',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold',
          }}
          onClick={() => setDirection(direction === 'LR' ? 'TB' : 'LR')}
        >
          {direction === 'LR' ? 'LR ↔' : 'TB ↕'}
        </button>
      </div>
    </div>
  );
};

// Render nodes using PixiJS Graphics
function renderNodes(container: Container, nodes: IGraphNode[]) {
  for (const node of nodes) {
    const nodeGraphics = createNodeGraphics(node);
    container.addChild(nodeGraphics);
  }
}

// Create a single node with Graphics
function createNodeGraphics(node: IGraphNode): Container {
  const nodeContainer = new Container();
  nodeContainer.x = node.position.x;
  nodeContainer.y = node.position.y;

  const width = 280;
  const headerHeight = 40;
  const lineHeight = 20;
  const padding = 10;

  // Calculate dynamic height based on number of fields
  const totalFields = node.data.primitiveFields.length + node.data.complexFields.length;
  const contentHeight = totalFields * lineHeight;
  const height = headerHeight + contentHeight + padding;

  // Draw node background
  const bg = new Graphics();
  bg.rect(0, 0, width, height);
  bg.fill({ color: 0x2a2a2a });
  bg.stroke({ color: 0x444444, width: 2 });
  nodeContainer.addChild(bg);

  // Draw node label
  const label = new Text({
    text: node.data.label,
    style: {
      fontFamily: 'Arial',
      fontSize: 18, // Increased from 16 to 18 (2px larger)
      fill: 0xffffff,
      fontWeight: 'bold',
    },
  });
  label.x = 10;
  label.y = 10;
  nodeContainer.addChild(label);

  // Draw target handle on the left side (only if node has a parent)
  // eslint-disable-next-line no-underscore-dangle
  if (node.data._parent != null) {
    const targetHandle = new Graphics();
    targetHandle.circle(0, 10, 5); // Left edge, near the top

    // Use parent's type to determine color
    // array: orange (0xffaa00), object: blue (0x88ccff)
    // eslint-disable-next-line no-underscore-dangle
    const parentType = node.data._parent.data.nodeType;
    const handleColor = parentType === 'array' ? 0xffaa00 : 0x88ccff;

    targetHandle.fill({ color: handleColor });
    nodeContainer.addChild(targetHandle);
  }

  // Draw primitive fields
  let yOffset = headerHeight;
  for (const field of node.data.primitiveFields) {
    const fieldText = new Text({
      text: `${field.key}: ${String(field.value).substring(0, 20)}`,
      style: {
        fontFamily: 'Arial',
        fontSize: 13, // Increased from 12 to 13 (1px larger)
        fill: 0xcccccc,
      },
    });
    fieldText.x = 10;
    fieldText.y = yOffset;
    nodeContainer.addChild(fieldText);
    yOffset += lineHeight;
  }

  // Draw complex fields
  for (const field of node.data.complexFields) {
    const fieldText = new Text({
      text: `${field.key}: ${field.type === 'array' ? `[${field.size}]` : `{${field.size}}`}`,
      style: {
        fontFamily: 'Arial',
        fontSize: 13, // Increased from 12 to 13 (1px larger)
        fill: 0x88ccff,
      },
    });
    fieldText.x = 10;
    fieldText.y = yOffset;
    nodeContainer.addChild(fieldText);

    // Draw connection point (handle) - outside the node border
    const handle = new Graphics();
    handle.circle(width, yOffset + 8, 5); // At the right edge, not inside
    handle.fill({ color: 0xffaa00 });
    nodeContainer.addChild(handle);

    yOffset += lineHeight;
  }

  return nodeContainer;
}

// Render edges using PixiJS Graphics with smooth bezier curves
function renderEdges(container: Container, edges: IGraphEdge[], nodes: IGraphNode[], direction: 'LR' | 'TB' = 'TB') {
  // Create a map for quick node lookup
  const nodeMap = new Map<string, IGraphNode>();
  for (const node of nodes) {
    nodeMap.set(node.id, node);
  }

  for (const edge of edges) {
    const sourceNode = nodeMap.get(edge.source);
    const targetNode = nodeMap.get(edge.target);

    if (sourceNode == null || targetNode == null) {
      continue;
    }

    // Calculate source position based on the specific complex field handle
    const width = 280;
    const headerHeight = 40;
    const lineHeight = 20;

    // Find which complex field this edge is coming from
    const sourceFieldIndex = sourceNode.data.complexFields.findIndex((field) => edge.label === field.key);

    let sourceY: number;
    if (sourceFieldIndex >= 0) {
      // Calculate Y position of this specific complex field
      const primitiveFieldsCount = sourceNode.data.primitiveFields.length;
      const fieldYOffset = headerHeight + primitiveFieldsCount * lineHeight + sourceFieldIndex * lineHeight;
      sourceY = sourceNode.position.y + fieldYOffset + 8; // +8 to center on the field line
    } else {
      // Fallback to middle of node if field not found
      sourceY = sourceNode.position.y + 75;
    }

    // Handle is at the right edge of the node (width)
    const sourceX = sourceNode.position.x + width; // Handle position at right edge
    const targetX = targetNode.position.x; // Left edge of target node
    const targetY = targetNode.position.y + 10; // Top of target node with small offset

    // Calculate control points for bezier curve
    const deltaX = targetX - sourceX;
    const deltaY = targetY - sourceY;

    // Control points for smooth curve (similar to XYFlow)
    // Use layout direction to determine curve direction
    let cp1X: number;
    let cp1Y: number;
    let cp2X: number;
    let cp2Y: number;

    if (direction === 'LR') {
      // Horizontal flow - extend control points horizontally
      const offset = Math.abs(deltaX) * 0.5;
      cp1X = sourceX + offset;
      cp1Y = sourceY;
      cp2X = targetX - offset;
      cp2Y = targetY;
    } else {
      // Vertical flow (TB) - extend control points vertically
      const offset = Math.abs(deltaY) * 0.5;
      cp1X = sourceX;
      cp1Y = sourceY + offset;
      cp2X = targetX;
      cp2Y = targetY - offset;
    }

    // Draw smooth bezier curve
    const line = new Graphics();
    line.moveTo(sourceX, sourceY);
    line.bezierCurveTo(cp1X, cp1Y, cp2X, cp2Y, targetX, targetY);
    line.stroke({ color: 0x666666, width: 2 });

    container.addChild(line);
  }
}

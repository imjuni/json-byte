import { useEffect, useRef, useState } from 'react';

import { Application, Container, Graphics } from 'pixi.js';

import { PixiJsonField } from '#/components/renderer/pixi/components/node/PixiJsonField';
import { layoutNodes } from '#/lib/graph/layoutNodes';
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
  const [isLayouting, setIsLayouting] = useState(false);
  const [isRendering, setIsRendering] = useState(false);

  // Apply ELK layout when nodes/edges/direction change
  useEffect(() => {
    if (nodes.length === 0) {
      setLayoutedNodes([]);
      setIsLayouting(false);
      return;
    }

    // Limit: If too many nodes, skip rendering to prevent browser freeze
    const MAX_NODES = 10000;

    if (nodes.length > MAX_NODES) {
      // eslint-disable-next-line no-console
      console.warn(`Too many nodes (${nodes.length}). Maximum is ${MAX_NODES}. Skipping graph render.`);
      setLayoutedNodes([]);
      setIsLayouting(false);
      return;
    }

    setIsLayouting(true);

    // Use setTimeout to allow loading UI to render first
    setTimeout(() => {
      try {
        const layoutApplied = layoutNodes(nodes, edges, direction);

        setLayoutedNodes(layoutApplied);
        setIsLayouting(false);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Dagre layout failed:', error);
        // Fallback to original nodes if layout fails
        setLayoutedNodes(nodes);
        setIsLayouting(false);
      }
    }, 100);
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

        // DO NOT render here - let the second useEffect handle initial rendering
        // This prevents duplicate rendering on mount

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

    // Start rendering
    setIsRendering(true);

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

      console.log('Rendering graph:', {
        nodeCount: layoutedNodes.length,
        edgeCount: edges.length,
        direction: edgeDirection,
      });

      renderEdges(edgeContainer, edges, layoutedNodes, edgeDirection);
      renderNodes(nodeContainer, layoutedNodes);

      console.log('Rendering completed');

      // Position viewport to show root node at 20%, 20% of screen
      // Find root node (id === '$')
      const rootNode = layoutedNodes.find((node) => node.id === '$');

      if (rootNode && appRef.current && viewportRef.current) {
        const canvasWidth = appRef.current.canvas.width;
        const canvasHeight = appRef.current.canvas.height;

        // Calculate zoom based on node count
        // Many nodes (1000+): 80%, Few nodes: 100%
        const initialZoom = layoutedNodes.length > 1000 ? 0.8 : 1.0;

        // Position root node at 20% from top-left
        const targetScreenX = canvasWidth * 0.2;
        const targetScreenY = canvasHeight * 0.2;

        // Calculate viewport position
        // viewport.x + (rootNode.x * zoom) = targetScreenX
        // viewport.x = targetScreenX - (rootNode.x * zoom)
        viewportRef.current.scale.set(initialZoom);
        viewportRef.current.x = targetScreenX - rootNode.position.x * initialZoom;
        viewportRef.current.y = targetScreenY - rootNode.position.y * initialZoom;

        console.log('Initial viewport positioned:', {
          zoom: initialZoom,
          rootNodePos: rootNode.position,
          viewportPos: { x: viewportRef.current.x, y: viewportRef.current.y },
        });
      }

      // Wait for next frame to ensure PixiJS has rendered everything
      requestAnimationFrame(() => {
        setIsRendering(false);
        console.log('PixiJS rendering complete - UI ready');
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error rendering graph:', error);
      setIsRendering(false);
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

      {/* Loading message during layout calculation and rendering */}
      {(isLayouting || isRendering) && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            padding: '30px',
            backgroundColor: 'rgba(42, 42, 42, 0.98)',
            color: 'white',
            border: '3px solid #88ccff',
            borderRadius: '12px',
            textAlign: 'center',
            maxWidth: '500px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
            zIndex: 1000,
          }}
        >
          <h3 style={{ margin: '0 0 15px 0', color: '#88ccff', fontSize: '20px' }}>
            {isLayouting ? 'Calculating Graph Layout...' : 'Rendering Graph...'}
          </h3>
          <p style={{ margin: '0 0 10px 0', fontSize: '14px', lineHeight: '1.6' }}>
            Processing <strong>{isLayouting ? nodes.length : layoutedNodes.length}</strong> nodes and{' '}
            <strong>{edges.length}</strong> edges.
          </p>
          <p style={{ margin: '0', fontSize: '13px', color: '#aaa', lineHeight: '1.5' }}>
            {(isLayouting ? nodes.length : layoutedNodes.length) > 1000
              ? 'Large graphs may take 10-30 seconds. Please wait...'
              : 'This may take a few seconds...'}
          </p>
          {/* Simple loading spinner */}
          <div
            style={{
              marginTop: '20px',
              display: 'inline-block',
              width: '40px',
              height: '40px',
              border: '4px solid #333',
              borderTop: '4px solid #88ccff',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
            }}
          />
          <style>
            {`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}
          </style>
        </div>
      )}

      {/* Warning message for too many nodes */}
      {nodes.length > 5000 && !isLayouting && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            padding: '20px',
            backgroundColor: 'rgba(42, 42, 42, 0.95)',
            color: 'white',
            border: '2px solid #ff6666',
            borderRadius: '8px',
            textAlign: 'center',
            maxWidth: '400px',
          }}
        >
          <h3 style={{ margin: '0 0 10px 0', color: '#ff6666' }}>Too Many Nodes</h3>
          <p style={{ margin: '0' }}>
            The file contains {nodes.length} nodes. Maximum supported is 5000 nodes.
            <br />
            Please use a smaller file.
          </p>
        </div>
      )}

      {/* Direction toggle button */}
      {nodes.length <= 5000 && !isLayouting && (
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
      )}
    </div>
  );
};

// Render nodes using PixiJS Graphics
function renderNodes(container: Container, nodes: IGraphNode[]) {
  console.time('renderNodes');

  // Batch add children for better performance
  const nodeGraphics: Container[] = [];
  for (const node of nodes) {
    nodeGraphics.push(createNodeGraphics(node));
  }

  container.addChild(...nodeGraphics);

  console.timeEnd('renderNodes');
  console.log(`Rendered ${nodes.length} nodes`);
}

// Create a single node with Graphics
function createNodeGraphics(node: IGraphNode): Container {
  const nodeContainer = new Container();
  nodeContainer.x = node.position.x;
  nodeContainer.y = node.position.y;

  const width = 280;
  const headerHeight = 40;
  const lineHeight = 26; // Increased from 20 to 26 for more breathing room
  const paddingTop = 10;
  const paddingBottom = 10;
  const paddingLeft = 12;
  const paddingRight = 12;

  const container = PixiJsonField({
    node,
    offset: {
      y: 0,
    },
    size: {
      width,
      headerHeight,
    },
    font: {
      size: 18,
      weight: 'normal',
      line: {
        height: lineHeight,
      },
    },
    padding: {
      t: paddingTop,
      b: paddingBottom,
      l: paddingLeft,
      r: paddingRight,
    },

    border: {
      radious: 8,
      width: 2,
    },
  });

  return container;
}

// Helper function to calculate node height
function getNodeHeight(node: IGraphNode): number {
  const headerHeight = 40;
  const lineHeight = 26;
  const paddingTop = 10;
  const paddingBottom = 10;
  const totalFields = node.data.primitiveFields.length + node.data.complexFields.length;
  const contentHeight = totalFields * lineHeight;
  return headerHeight + contentHeight + paddingTop + paddingBottom;
}

// Render edges using PixiJS Graphics with smooth bezier curves
function renderEdges(container: Container, edges: IGraphEdge[], nodes: IGraphNode[], direction: 'LR' | 'TB' = 'TB') {
  console.time('renderEdges');

  // Create a map for quick node lookup
  const nodeMap = new Map<string, IGraphNode>();
  for (const node of nodes) {
    nodeMap.set(node.id, node);
  }

  // Use a single Graphics object for all edges (much faster!)
  const edgeGraphics = new Graphics();

  for (const edge of edges) {
    const sourceNode = nodeMap.get(edge.source);
    const targetNode = nodeMap.get(edge.target);

    if (sourceNode == null || targetNode == null) {
      continue;
    }

    // Calculate source position based on the specific complex field handle
    const width = 280;
    const headerHeight = 40;
    const lineHeight = 26; // Match PixiGraphRenderer
    const paddingTop = 10;

    // Find which complex field this edge is coming from
    const sourceFieldIndex = sourceNode.data.complexFields.findIndex((field) => edge.label === field.key);

    let sourceY: number;
    if (sourceFieldIndex >= 0) {
      // Calculate Y position of this specific complex field
      const primitiveFieldsCount = sourceNode.data.primitiveFields.length;
      const fieldYOffset =
        headerHeight + paddingTop + primitiveFieldsCount * lineHeight + sourceFieldIndex * lineHeight;
      sourceY = sourceNode.position.y + fieldYOffset + lineHeight / 2; // Match handle position (centered)
    } else {
      // Fallback to middle of node if field not found
      sourceY = sourceNode.position.y + 75;
    }

    // Handle is at the right edge of the node (width)
    const sourceX = sourceNode.position.x + width; // Handle position at right edge
    const targetX = targetNode.position.x; // Left edge of target node
    // Target handle is at the vertical center of the target node
    const targetNodeHeight = getNodeHeight(targetNode);
    const targetY = targetNode.position.y + targetNodeHeight / 2;

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

    // Draw smooth bezier curve on the shared Graphics object
    edgeGraphics.moveTo(sourceX, sourceY);
    edgeGraphics.bezierCurveTo(cp1X, cp1Y, cp2X, cp2Y, targetX, targetY);
  }

  // Apply stroke to all edges at once
  edgeGraphics.stroke({ color: 0x666666, width: 2 });
  container.addChild(edgeGraphics);

  console.timeEnd('renderEdges');
  console.log(`Rendered ${edges.length} edges`);
}

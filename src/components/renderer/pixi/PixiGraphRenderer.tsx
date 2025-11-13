import { useEffect, useRef, useState } from 'react';

import { Viewport } from 'pixi-viewport';
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
  const viewportRef = useRef<Viewport | null>(null);
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
    const MAX_NODES = 20000;

    if (nodes.length > MAX_NODES) {
      // eslint-disable-next-line no-console
      console.warn(`Too many nodes (${nodes.length}). Maximum is ${MAX_NODES}. Skipping graph render.`);
      setLayoutedNodes([]);
      setIsLayouting(false);
      return;
    }

    // eslint-disable-next-line no-console
    console.log('[PERF] Starting layout process', {
      nodeCount: nodes.length,
      edgeCount: edges.length,
      timestamp: new Date().toISOString(),
    });

    setIsLayouting(true);

    // Use setTimeout to allow loading UI to render first
    setTimeout(() => {
      const layoutStartTime = performance.now();
      console.log('[LAYOUT] Started layout calculation', {
        nodeCount: nodes.length,
        edgeCount: edges.length,
        direction,
      });

      try {
        const layoutApplied = layoutNodes(nodes, edges, direction);

        const layoutEndTime = performance.now();
        const layoutDuration = layoutEndTime - layoutStartTime;
        console.log('[LAYOUT] Layout calculation completed', {
          duration: `${layoutDuration.toFixed(2)}ms`,
          nodesProcessed: layoutApplied.length,
        });

        setLayoutedNodes(layoutApplied);
        setIsLayouting(false);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('[LAYOUT] Layout calculation failed:', error);
        // Fallback to original nodes if layout fails
        setLayoutedNodes(nodes);
        setIsLayouting(false);
      }
    }, 100);
  }, [nodes, edges, direction]);

  useEffect(() => {
    if (canvasRef.current == null) return;

    let mounted = true;

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

        // Create viewport with pixi-viewport
        const viewport = new Viewport({
          screenWidth: canvasRef.current.clientWidth || 800,
          screenHeight: canvasRef.current.clientHeight || 600,
          worldWidth: 10000,
          worldHeight: 10000,
          events: app.renderer.events,
        });

        // Add viewport to stage
        app.stage.addChild(viewport);
        viewportRef.current = viewport;

        // Enable drag, pinch, wheel plugins
        // Note: decelerate disabled for large graphs to reduce CPU usage
        viewport
          .drag({
            mouseButtons: 'left',
          })
          .pinch()
          .wheel({
            smooth: 3,
            percent: 0.1,
          })
          .clamp({
            left: -5000,
            right: 15000,
            top: -5000,
            bottom: 15000,
          })
          .clampZoom({
            minScale: 0.1,
            maxScale: 5,
          });

        // Disable culling for now - it's causing 100% CPU usage on large graphs
        // The culling calculation for 16k+ nodes is too expensive
        // TODO: Implement more efficient culling or virtual rendering

        // eslint-disable-next-line no-console
        console.log('[VIEWPORT] pixi-viewport initialized (culling disabled for performance)');
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
        // pixi-viewport automatically cleans up its event listeners
        appRef.current.destroy(true, { children: true, texture: true });
        appRef.current = null;
      }
      if (viewportRef.current) {
        viewportRef.current.destroy();
        viewportRef.current = null;
      }
    };
  }, []);

  // Re-render when layouted nodes change
  useEffect(() => {
    if (!isInitializedRef.current || appRef.current == null || viewportRef.current == null) return;
    if (layoutedNodes.length === 0) return;

    // Start rendering
    setIsRendering(true);

    const renderStartTime = performance.now();
    console.log('[RENDER] Started rendering process', {
      nodeCount: layoutedNodes.length,
      edgeCount: edges.length,
    });

    try {
      const clearStartTime = performance.now();
      // Clear viewport's children only, not the viewport itself
      viewportRef.current.removeChildren();
      console.log('[RENDER] Cleared viewport', {
        duration: `${(performance.now() - clearStartTime).toFixed(2)}ms`,
      });

      const containerStartTime = performance.now();
      // Recreate containers inside viewport
      const edgeContainer = new Container();
      const nodeContainer = new Container();
      viewportRef.current.addChild(edgeContainer);
      viewportRef.current.addChild(nodeContainer);
      console.log('[RENDER] Created containers', {
        duration: `${(performance.now() - containerStartTime).toFixed(2)}ms`,
      });

      // Re-render edges and nodes with layouted positions
      const edgeDirection = direction === 'LR' || direction === 'RL' ? 'LR' : 'TB';

      const edgeRenderStartTime = performance.now();
      renderEdges(edgeContainer, edges, layoutedNodes, edgeDirection);
      const edgeRenderDuration = performance.now() - edgeRenderStartTime;
      console.log('[RENDER] Edges rendered', {
        duration: `${edgeRenderDuration.toFixed(2)}ms`,
        edgeCount: edges.length,
      });

      const nodeRenderStartTime = performance.now();
      renderNodes(nodeContainer, layoutedNodes);
      const nodeRenderDuration = performance.now() - nodeRenderStartTime;
      console.log('[RENDER] Nodes rendered', {
        duration: `${nodeRenderDuration.toFixed(2)}ms`,
        nodeCount: layoutedNodes.length,
      });

      const totalRenderDuration = performance.now() - renderStartTime;
      console.log('[RENDER] Rendering completed', {
        totalDuration: `${totalRenderDuration.toFixed(2)}ms`,
        edgeDuration: `${edgeRenderDuration.toFixed(2)}ms`,
        nodeDuration: `${nodeRenderDuration.toFixed(2)}ms`,
      });

      // Position viewport to show root node at 20%, 20% of screen
      // Find root node (id === '$')
      const rootNode = layoutedNodes.find((node) => node.id === '$');

      if (rootNode && appRef.current && viewportRef.current) {
        // Calculate zoom based on node count
        // Many nodes (1000+): 80%, Few nodes: 100%
        const initialZoom = layoutedNodes.length > 1000 ? 0.8 : 1.0;

        // Use pixi-viewport's methods to position and zoom
        viewportRef.current.setZoom(initialZoom, true);
        viewportRef.current.moveCenter(rootNode.position.x, rootNode.position.y);

        // eslint-disable-next-line no-console
        console.log('[VIEWPORT] Initial viewport positioned:', {
          zoom: initialZoom,
          rootNodePos: rootNode.position,
          center: viewportRef.current.center,
        });
      }

      // Wait for next frame to ensure PixiJS has rendered everything
      requestAnimationFrame(() => {
        const frameCompleteTime = performance.now();
        const totalTime = frameCompleteTime - renderStartTime;
        setIsRendering(false);
        console.log('[RENDER] PixiJS frame rendered - UI ready', {
          totalTimeWithFrame: `${totalTime.toFixed(2)}ms`,
        });
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
      {nodes.length > 20000 && !isLayouting && (
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

// Render nodes using PixiJS Graphics with chunking for large datasets
function renderNodes(container: Container, nodes: IGraphNode[]) {
  const startTime = performance.now();
  console.log('[RENDER:NODES] Starting node rendering', { nodeCount: nodes.length });

  // Batch add children for better performance
  // Use smaller chunks and add them incrementally to avoid blocking
  const CHUNK_SIZE = 50;
  const nodeGraphics: Container[] = [];
  const createStartTime = performance.now();

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    nodeGraphics.push(createNodeGraphics(node));

    // Log progress for every 100 nodes
    if ((i + 1) % 100 === 0) {
      const elapsed = performance.now() - createStartTime;
      const avgTime = elapsed / (i + 1);
      const remaining = (nodes.length - i - 1) * avgTime;
      console.log('[RENDER:NODES] Progress', {
        completed: i + 1,
        total: nodes.length,
        avgTimePerNode: `${avgTime.toFixed(2)}ms`,
        estimatedRemaining: `${remaining.toFixed(0)}ms`,
      });
    }

    // Add in chunks to avoid call stack overflow
    if (nodeGraphics.length >= CHUNK_SIZE) {
      container.addChild(...nodeGraphics.splice(0, CHUNK_SIZE));
    }
  }

  const createEndTime = performance.now();
  const createDuration = createEndTime - createStartTime;
  console.log('[RENDER:NODES] Node graphics created', {
    duration: `${createDuration.toFixed(2)}ms`,
    avgPerNode: `${(createDuration / nodes.length).toFixed(2)}ms`,
  });

  // Add remaining nodes
  const addStartTime = performance.now();
  if (nodeGraphics.length > 0) {
    container.addChild(...nodeGraphics);
  }
  const addDuration = performance.now() - addStartTime;
  console.log('[RENDER:NODES] Added to container', {
    duration: `${addDuration.toFixed(2)}ms`,
  });

  const totalDuration = performance.now() - startTime;
  console.log('[RENDER:NODES] Node rendering complete', {
    totalDuration: `${totalDuration.toFixed(2)}ms`,
    nodeCount: nodes.length,
  });
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
  const startTime = performance.now();
  console.log('[RENDER:EDGES] Starting edge rendering', { edgeCount: edges.length, nodeCount: nodes.length });

  // Create a map for quick node lookup
  const mapStartTime = performance.now();
  const nodeMap = new Map<string, IGraphNode>();
  for (const node of nodes) {
    nodeMap.set(node.id, node);
  }
  const mapDuration = performance.now() - mapStartTime;
  console.log('[RENDER:EDGES] Node map created', {
    duration: `${mapDuration.toFixed(2)}ms`,
    nodes: nodeMap.size,
  });

  // Use a single Graphics object for all edges (much faster!)
  const edgeGraphics = new Graphics();

  const drawStartTime = performance.now();
  for (let i = 0; i < edges.length; i++) {
    const edge = edges[i];
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

  const drawDuration = performance.now() - drawStartTime;
  console.log('[RENDER:EDGES] Edge paths calculated', {
    duration: `${drawDuration.toFixed(2)}ms`,
    avgPerEdge: `${(drawDuration / edges.length).toFixed(2)}ms`,
  });

  // Apply stroke to all edges at once
  const strokeStartTime = performance.now();
  edgeGraphics.stroke({ color: 0x666666, width: 2 });
  const strokeDuration = performance.now() - strokeStartTime;
  console.log('[RENDER:EDGES] Stroke applied', {
    duration: `${strokeDuration.toFixed(2)}ms`,
  });

  const addStartTime = performance.now();
  container.addChild(edgeGraphics);
  const addDuration = performance.now() - addStartTime;
  console.log('[RENDER:EDGES] Added to container', {
    duration: `${addDuration.toFixed(2)}ms`,
  });

  const totalDuration = performance.now() - startTime;
  console.log('[RENDER:EDGES] Edge rendering complete', {
    totalDuration: `${totalDuration.toFixed(2)}ms`,
    edgeCount: edges.length,
    breakdown: {
      nodeMap: `${mapDuration.toFixed(2)}ms`,
      drawing: `${drawDuration.toFixed(2)}ms`,
      stroke: `${strokeDuration.toFixed(2)}ms`,
      addToContainer: `${addDuration.toFixed(2)}ms`,
    },
  });
}

import { useCallback, useEffect, useMemo, useRef } from 'react';

import { Controls, MiniMap, ReactFlow, ReactFlowProvider, useNodesInitialized, useReactFlow } from '@xyflow/react';
import { Subject } from 'rxjs';
import { debounceTime, tap } from 'rxjs/operators';

import { ObjectNode } from '#/components/renderer/xyflow/ObjectNode';
import { SearchPanel } from '#/components/renderer/xyflow/SearchPanel';
import { applyNodeDimensionChanges } from '#/lib/graph/applyNodeDimensionChanges';
import { CE_GRAPH_NODE_TYPE } from '#/lib/graph/const-enum/CE_GRAPH_NODE_TYPE';
import { layoutNodes } from '#/lib/graph/layoutNodes';
import { useEditorStore } from '#/stores/editorStore';
import { useGraphStore } from '#/stores/graphStore';

import type { Edge, NodeChange } from '@xyflow/react';

import type { IGraphNode } from '#/lib/graph/interfaces/IGraphNode';

// Inner component that uses React Flow hooks
const FlowContent = () => {
  const { nodes, edges, nodeMap, direction, locMap, setNodes } = useGraphStore();
  const { content, editorInstance } = useEditorStore();
  const nodesInitialized = useNodesInitialized();
  const hasRelayoutedRef = useRef(false);
  const { fitView, setCenter, getZoom } = useReactFlow();
  const relayout$ = useMemo(() => new Subject<void>(), []);

  const handleReLayout = useCallback(() => {
    // Check if nodes have been measured
    const allMeasured = nodes.every((node) => node.measured);

    if (allMeasured) {
      // Re-layout with measured dimensions
      const layoutedNodes = layoutNodes(nodes, edges, direction);
      setNodes(layoutedNodes);
      hasRelayoutedRef.current = true;

      // Call fitView after re-layout
      setTimeout(() => {
        fitView({ padding: 0.2, duration: 200 });
      }, 10);
    }
  }, [nodes, edges, direction, setNodes, fitView]);

  useEffect(() => {
    const subscription = relayout$
      .pipe(
        debounceTime(200),
        tap(() => handleReLayout()),
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [relayout$, handleReLayout]);

  // Trigger re-layout when nodes are measured
  useEffect(() => {
    if (nodesInitialized && !hasRelayoutedRef.current && nodes.length > 0) {
      relayout$.next();
    }
  }, [nodesInitialized, nodes, relayout$]);

  const handleNodesChange = useCallback(
    (changes: NodeChange<IGraphNode>[]) => {
      const hasDimensionChanges = changes.some((change) => change.type === 'dimensions' && change.dimensions != null);

      if (hasDimensionChanges) {
        // Reset relayout flag when dimensions change to trigger re-layout
        setNodes(applyNodeDimensionChanges(nodes, changes));
        hasRelayoutedRef.current = false;
      }
    },
    [nodes, setNodes],
  );

  const handleMoveNodeCenter = useCallback(
    (node: IGraphNode) => {
      // Center the node in the viewport
      const x = node.position.x + (node.measured?.width ?? 0) / 2;
      const y = node.position.y + (node.measured?.height ?? 0) / 2;
      const currentZoom = getZoom();

      const zoom = currentZoom > 0.8 ? currentZoom : 1;

      setCenter(x, y, { zoom, duration: 400 });
    },
    [getZoom, setCenter],
  );

  const handleNodeClick = useCallback(
    (_event: React.MouseEvent, node: IGraphNode) => {
      // Center the node in the viewport
      handleMoveNodeCenter(node);

      // Select the corresponding text in the editor
      if (editorInstance != null && content != null) {
        const locEntry = locMap[node.id];

        if (node.id === '$') {
          // Set selection in the editor
          editorInstance.setSelection({
            startLineNumber: 1,
            startColumn: 1,
            endLineNumber: 1,
            endColumn: 1,
          });

          // Reveal the selection in the editor viewport
          editorInstance.revealLineInCenter(1);

          // Focus the editor
          editorInstance.focus();
        } else if (node.id !== '$' && locEntry != null) {
          // Set selection in the editor
          editorInstance.setSelection({
            startLineNumber: locEntry.loc.start.line,
            startColumn: locEntry.loc.start.column,
            endLineNumber: locEntry.loc.end.line,
            endColumn: locEntry.loc.end.column,
          });

          // Reveal the selection in the editor viewport
          editorInstance.revealLineInCenter(locEntry.loc.start.line);

          // Focus the editor
          editorInstance.focus();
        }
      }
    },
    [handleMoveNodeCenter, editorInstance, content, locMap],
  );

  const handleEdgeClick = useCallback(
    (_event: React.MouseEvent, edge: Edge) => {
      const targetPath = edge.target;
      const locEntry = locMap[targetPath];

      if (editorInstance == null || locEntry == null) {
        return;
      }

      const targetNode = nodeMap[targetPath];

      if (targetNode != null) {
        handleMoveNodeCenter(targetNode);
      }

      editorInstance.setSelection({
        startLineNumber: locEntry.loc.start.line,
        startColumn: locEntry.loc.start.column,
        endLineNumber: locEntry.loc.end.line,
        endColumn: locEntry.loc.end.column,
      });
      editorInstance.revealLineInCenter(locEntry.loc.start.line);
      editorInstance.focus();
    },
    [editorInstance, handleMoveNodeCenter, locMap, nodeMap],
  );

  return (
    <ReactFlow
      className="bg-background"
      edges={edges}
      nodes={nodes}
      proOptions={{ hideAttribution: true }}
      // eslint-disable-next-line react/jsx-sort-props
      onEdgeClick={handleEdgeClick}
      // eslint-disable-next-line react/jsx-sort-props
      onNodeClick={handleNodeClick}
      // eslint-disable-next-line react/jsx-sort-props
      onNodesChange={handleNodesChange}
      defaultEdgeOptions={{
        labelStyle: { padding: '0 8px' },
        labelBgPadding: [8, 4],
        labelBgBorderRadius: 4,
      }}
      nodeTypes={{
        [CE_GRAPH_NODE_TYPE.PLAIN_OBJECT_NODE]: ObjectNode,
        [CE_GRAPH_NODE_TYPE.PLAIN_ARRAY_NODE]: ObjectNode,
        [CE_GRAPH_NODE_TYPE.PLAIN_STRING_NODE]: ObjectNode,
        [CE_GRAPH_NODE_TYPE.PLAIN_NULL_NODE]: ObjectNode,
        [CE_GRAPH_NODE_TYPE.PLAIN_NUMBER_NODE]: ObjectNode,
        [CE_GRAPH_NODE_TYPE.PLAIN_BOOLEAN_NODE]: ObjectNode,
      }}
    >
      <Controls
        className="[&_button]:!bg-card [&_button]:!border-border [&_button]:!text-foreground [&_button:hover]:!bg-accent"
        showInteractive={false}
      />
      <MiniMap className="hidden md:block !bg-card !border-border" />
      <SearchPanel />
    </ReactFlow>
  );
};

// Outer component with ReactFlowProvider
export const XYFlowRenderer = () => (
  <ReactFlowProvider>
    <FlowContent />
  </ReactFlowProvider>
);

import { useCallback, useEffect, useRef } from 'react';

import { Controls, MiniMap, ReactFlow, ReactFlowProvider, useNodesInitialized, useReactFlow } from '@xyflow/react';

import { ObjectNode } from '#/components/renderer/xyflow/ObjectNode';
import { SearchPanel } from '#/components/renderer/xyflow/SearchPanel';
import { CE_XYFLOW_NODE_TYPE } from '#/lib/xyflow/const-enum/CE_XYFLOW_NODE_TYPE';
import { layoutNodes } from '#/lib/xyflow/layoutNodes';
import { useXyFlowStore } from '#/stores/xyflowStore';

import type { NodeChange } from '@xyflow/react';

import type { IXyFlowNode } from '#/lib/xyflow/interfaces/IXyFlowNode';

// Inner component that uses React Flow hooks
const FlowContent = () => {
  const { nodes, edges, direction, setNodes } = useXyFlowStore();
  const nodesInitialized = useNodesInitialized();
  const hasRelayoutedRef = useRef(false);
  const { fitView, setCenter, getZoom } = useReactFlow();

  // Trigger re-layout when nodes are measured
  useEffect(() => {
    if (nodesInitialized && !hasRelayoutedRef.current && nodes.length > 0) {
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
        }, 0);
      }
    }
  }, [nodesInitialized, nodes, edges, direction, setNodes, fitView]);

  // Reset re-layout flag when edges change (new document loaded)
  useEffect(() => {
    hasRelayoutedRef.current = false;
  }, [edges.length]);

  const handleNodesChange = useCallback(
    (changes: NodeChange<IXyFlowNode>[]) => {
      // Handle node changes from React Flow
      const updatedNodes = nodes.map((node) => {
        const finded = changes.find((change: NodeChange<IXyFlowNode>) => {
          if ('id' in change) {
            return change.id === node.id;
          }

          return false;
        });

        if (finded?.type === 'dimensions' && finded.dimensions) {
          return {
            ...node,
            measured: {
              width: finded.dimensions.width,
              height: finded.dimensions.height,
            },
          };
        }
        return node;
      });

      setNodes(updatedNodes);
    },
    [nodes, setNodes],
  );

  const handleNodeClick = useCallback(
    (_event: React.MouseEvent, node: IXyFlowNode) => {
      const x = node.position.x + (node.measured?.width ?? 0) / 2;
      const y = node.position.y + (node.measured?.height ?? 0) / 2;
      const currentZoom = getZoom();

      const zoom = currentZoom > 0.8 ? currentZoom : 1;

      setCenter(x, y, { zoom, duration: 400 });
    },
    [setCenter, getZoom],
  );

  return (
    <ReactFlow
      className="bg-background"
      edges={edges}
      nodes={nodes}
      proOptions={{ hideAttribution: true }}
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
        [CE_XYFLOW_NODE_TYPE.PLAIN_OBJECT_NODE]: ObjectNode,
      }}
    >
      <Controls
        className="[&_button]:!bg-card [&_button]:!border-border [&_button]:!text-foreground [&_button:hover]:!bg-accent"
        showInteractive={false}
      />
      <MiniMap className="!bg-card !border-border" />
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

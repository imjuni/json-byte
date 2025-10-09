import { useCallback, useEffect, useRef } from 'react';

import { Controls, ReactFlow, ReactFlowProvider, useNodesInitialized } from '@xyflow/react';

import { ObjectNode } from '#/components/renderer/xyflow/ObjectNode';
import { CE_XYFLOW_NODE_TYPE } from '#/lib/xyflow/const-enum/CE_XYFLOW_NODE_TYPE';
import { layoutNodes } from '#/lib/xyflow/layoutNodes';
import { useXyFlowStore } from '#/stores/xyflowStore';

// Inner component that uses React Flow hooks
const FlowContent = () => {
  const { nodes, edges, direction, setNodes } = useXyFlowStore();
  const nodesInitialized = useNodesInitialized();
  const hasRelayoutedRef = useRef(false);

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
      }
    }
  }, [nodesInitialized, nodes, edges, direction, setNodes]);

  // Reset re-layout flag when edges change (new document loaded)
  useEffect(() => {
    hasRelayoutedRef.current = false;
  }, [edges.length]);

  const handleNodesChange = useCallback(
    (changes: any) => {
      // Handle node changes from React Flow
      const updatedNodes = nodes.map((node) => {
        const change = changes.find((c: any) => c.id === node.id);
        if (change?.type === 'dimensions' && change.dimensions) {
          return {
            ...node,
            measured: {
              width: change.dimensions.width,
              height: change.dimensions.height,
            },
          };
        }
        return node;
      });
      setNodes(updatedNodes);
    },
    [nodes, setNodes],
  );

  return (
    <ReactFlow
      fitView
      edges={edges}
      nodes={nodes}
      onNodesChange={handleNodesChange}
      nodeTypes={{
        [CE_XYFLOW_NODE_TYPE.PLAIN_OBJECT_NODE]: ObjectNode,
      }}
    >
      <Controls />
    </ReactFlow>
  );
};

// Outer component with ReactFlowProvider
export const XYFlowRenderer = () => (
  <ReactFlowProvider>
    <FlowContent />
  </ReactFlowProvider>
);

import { useCallback, useEffect, useRef } from 'react';

import { Controls, MiniMap, ReactFlow, ReactFlowProvider, useNodesInitialized, useReactFlow } from '@xyflow/react';

import { ObjectNode } from '#/components/renderer/xyflow/ObjectNode';
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
  const { fitView } = useReactFlow();

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

      // Call fitView after re-layout
      setTimeout(() => {
        fitView({ padding: 0.2, duration: 200 });
      }, 0);
    },
    [nodes, setNodes, fitView],
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
      <Controls className="!bottom-[50px]" showInteractive={false} />
      <MiniMap className="!bottom-[50px]" />
    </ReactFlow>
  );
};

// Outer component with ReactFlowProvider
export const XYFlowRenderer = () => (
  <ReactFlowProvider>
    <FlowContent />
  </ReactFlowProvider>
);

import { Controls, ReactFlow } from '@xyflow/react';

import { ObjectNode } from '#/components/renderer/xyflow/ObjectNode';
import { CE_XYFLOW_NODE_TYPE } from '#/lib/xyflow/const-enum/CE_XYFLOW_NODE_TYPE';
import { useXyFlowStore } from '#/stores/xyflowStore';

export const XYFlowRenderer = () => {
  const { nodes, edges } = useXyFlowStore();

  return (
    <ReactFlow
      fitView
      edges={edges}
      nodes={nodes}
      nodeTypes={{
        [CE_XYFLOW_NODE_TYPE.PLAIN_OBJECT_NODE]: ObjectNode,
      }}
    >
      <Controls />
    </ReactFlow>
  );
};

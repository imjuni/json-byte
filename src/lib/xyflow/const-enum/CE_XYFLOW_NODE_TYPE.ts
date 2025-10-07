export const CE_XYFLOW_NODE_TYPE = {
  PLAIN_OBJECT_NODE: 'PLAIN_OBJECT_NODE',
} as const;

export type CE_XYFLOW_NODE_TYPE = (typeof CE_XYFLOW_NODE_TYPE)[keyof typeof CE_XYFLOW_NODE_TYPE];

export const CE_GRAPH_NODE_TYPE = {
  PLAIN_OBJECT_NODE: 'object',
  PLAIN_ARRAY_NODE: 'array',
  PLAIN_STRING_NODE: 'string',
  PLAIN_BOOLEAN_NODE: 'boolean',
  PLAIN_NUMBER_NODE: 'number',
  PLAIN_NULL_NODE: 'null',
} as const;

export type CE_GRAPH_NODE_TYPE = (typeof CE_GRAPH_NODE_TYPE)[keyof typeof CE_GRAPH_NODE_TYPE];

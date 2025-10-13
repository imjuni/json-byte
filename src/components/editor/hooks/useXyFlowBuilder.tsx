import { useCallback } from 'react';

import { multiParse } from '#/lib/json/multiParse';
import { replaceHref } from '#/lib/replaceHref';
import { createXyFlowNodesWithEdges } from '#/lib/xyflow/createXyFlowNodesWithEdges';
import { createFuse, useFuseStore } from '#/stores/fuseStore';
import { useXyFlowStore } from '#/stores/xyflowStore';

import type { IXyFlowNode } from '#/lib/xyflow/interfaces/IXyFlowNode';

const ENABLE_QUERYSTRING = false;

/**
 * Custom hook for building and updating XyFlow graph visualization
 * Handles parsing content, creating nodes/edges, and updating stores
 */
export function useXyFlowBuilder(): {
  buildXyFlow: (value: ReturnType<typeof multiParse>) => IXyFlowNode[];
  updateFromContent: (content: string) => void;
} {
  const { direction, setNodesAndEdgesAndMap } = useXyFlowStore();
  const { setFuse } = useFuseStore();

  const buildXyFlow = useCallback(
    (value: ReturnType<typeof multiParse>): IXyFlowNode[] => {
      if (!(value instanceof Error)) {
        const { nodes, edges } = createXyFlowNodesWithEdges(value.data, direction);
        setNodesAndEdgesAndMap(nodes, edges);
        return nodes;
      }

      return [];
    },
    [direction, setNodesAndEdgesAndMap],
  );

  const updateFromContent = useCallback(
    (content: string) => {
      const document = multiParse(content);
      const nodes = buildXyFlow(document);
      setFuse(createFuse(nodes));

      if (ENABLE_QUERYSTRING) {
        setTimeout(() => replaceHref(document), 10);
      } else {
        window.history.replaceState(null, '', '/');
      }
    },
    [buildXyFlow, setFuse],
  );

  return {
    buildXyFlow,
    updateFromContent,
  };
}

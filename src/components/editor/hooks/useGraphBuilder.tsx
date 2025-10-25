import { useCallback } from 'react';

import { createGraphNodesAndEdgesAndLocMap } from '#/lib/graph/createGraphNodesAndEdgesAndLocMap';
import { multiParse } from '#/lib/json/multiParse';
import { ParserConfig } from '#/lib/parser/common/ParserConfig';
import { replaceHref } from '#/lib/replaceHref';
import { useEditorStore } from '#/stores/editorStore';
import { createFuse, useFuseStore } from '#/stores/fuseStore';
import { useGraphStore } from '#/stores/graphStore';

import type { IGraphNode } from '#/lib/graph/interfaces/IGraphNode';

const ENABLE_QUERYSTRING = false;

/**
 * Custom hook for building and updating XyFlow graph visualization
 * Handles parsing content, creating nodes/edges, and updating stores
 */
export function useGraphBuilder(): {
  buildGraph: (origin: string, value: ReturnType<typeof multiParse>) => IGraphNode[];
  updateFromContent: (content: string) => void;
} {
  const { direction, setNodesAndEdgesAndLocMapAndMap } = useGraphStore();
  const { setFuse } = useFuseStore();
  const { setLanguage } = useEditorStore();

  const buildGraph = useCallback(
    (origin: string, value: ReturnType<typeof multiParse>): IGraphNode[] => {
      if (!(value instanceof Error)) {
        const { nodes, edges, locMap } = createGraphNodesAndEdgesAndLocMap({
          document: value.data,
          language: value.language,
          origin,
          direction,
          config: new ParserConfig({ guard: 1_000_000 }),
        });

        setLanguage(value.language);
        setNodesAndEdgesAndLocMapAndMap(nodes, edges, locMap);

        return nodes;
      }

      return [];
    },
    [direction, setLanguage, setNodesAndEdgesAndLocMapAndMap],
  );

  const updateFromContent = useCallback(
    (content: string) => {
      const document = multiParse(content);
      const nodes = buildGraph(content, document);
      setFuse(createFuse(nodes));

      if (ENABLE_QUERYSTRING) {
        setTimeout(() => replaceHref(document), 10);
      } else {
        window.history.replaceState(null, '', '/');
      }
    },
    [buildGraph, setFuse],
  );

  return {
    buildGraph,
    updateFromContent,
  };
}

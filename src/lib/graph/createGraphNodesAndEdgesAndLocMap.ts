import { layoutNodes } from '#/lib/graph/layoutNodes';
import { buildLineStarts } from '#/lib/parser/json/buildLineStarts';
import { buildNodeByJson } from '#/lib/parser/json/buildNodeByJson';
import { buildNodeByYaml } from '#/lib/parser/yaml/buildNodeByYaml';

import type { JsonValue } from 'type-fest';

import type { TEditorLanguage } from '#/contracts/editors/IEditorStore';
import type { IGraphEdge } from '#/lib/graph/interfaces/IGraphEdge';
import type { IGraphNode } from '#/lib/graph/interfaces/IGraphNode';
import type { TLayoutDirection } from '#/lib/graph/layoutNodes';
import type { ParserConfig } from '#/lib/parser/common/ParserConfig';
import type { IPathLoCIndexMap } from '#/lib/parser/interfaces/IPathLoCIndexMap';

interface ICreateGraphNodesParams {
  /** 원본 JSON 문자열 */
  origin: string;

  /** JSON.parse 또는 jsonc.parse 를 통해 Object화 시킨 JSON 값 */
  document: JsonValue;

  /** 파싱 설정 */
  config: ParserConfig;

  /**
   * 언어
   *
   * - json
   * - yaml
   */
  language: TEditorLanguage;

  direction?: TLayoutDirection;
}

export function createGraphNodesAndEdgesAndLocMap({
  origin,
  document,
  config,
  language,
  direction,
}: ICreateGraphNodesParams): {
  nodes: IGraphNode[];
  edges: IGraphEdge[];
  locMap: IPathLoCIndexMap;
} {
  if (language === 'json') {
    const lineStarts = buildLineStarts(origin);
    const { nodes, edges, map } = buildNodeByJson({
      origin,
      document,
      config,
      lineStarts,
    });

    const layoutedNodes = layoutNodes(nodes, edges, direction);

    return { nodes: layoutedNodes, edges, locMap: map };
  }

  const { nodes, edges, map } = buildNodeByYaml({
    origin,
    document,
    config,
  });

  const layoutedNodes = layoutNodes(nodes, edges, direction);

  return { nodes: layoutedNodes, edges, locMap: map };
}

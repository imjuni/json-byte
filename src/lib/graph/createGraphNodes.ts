import { layoutNodes } from '#/lib/graph/layoutNodes';
import { buildLineStarts } from '#/lib/parser/json/buildLineStarts';
import { buildNodeByJson } from '#/lib/parser/json/buildNodeByJson';

import type { JsonValue } from 'type-fest';

import type { IGraphNode } from '#/lib/graph/interfaces/IGraphNode';
import type { TLayoutDirection } from '#/lib/graph/layoutNodes';
import type { ParserConfig } from '#/lib/parser/common/ParserConfig';

interface ICreateGraphNodesParams {
  /** 원본 JSON 문자열 */
  origin: string;

  /** JSON.parse 또는 jsonc.parse 를 통해 Object화 시킨 JSON 값 */
  document: JsonValue;

  /** 파싱 설정 */
  config: ParserConfig;

  direction?: TLayoutDirection;
}

export function createGraphNodes({ origin, document, config, direction }: ICreateGraphNodesParams): IGraphNode[] {
  const lineStarts = buildLineStarts(origin);
  const { nodes, edges } = buildNodeByJson({
    origin,
    document,
    config,
    lineStarts,
  });

  const layoutedNodes = layoutNodes(nodes, edges, direction);

  return layoutedNodes;
}

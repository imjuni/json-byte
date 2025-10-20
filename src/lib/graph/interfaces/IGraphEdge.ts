import type { IGraphNode } from '#/lib/graph/interfaces/IGraphNode';

export interface IGraphEdge {
  /** Edge 각 정점의 id 값을 hypen으로 연결한 edge id */
  id: string;

  /** 자식 객체 key 값. Edge label */
  label: string;

  /** Source node id */
  source: string;

  /** Source handle id - complex field의 key를 사용 */
  sourceHandle?: string;

  /** Target node id */
  target: string;

  /** Target handle id - 고정값 "target-top" */
  targetHandle?: string;

  /** 데이터 */
  data: {
    /** Edge 정점 중에 parent */
    parent: IGraphNode;

    /** Edge 정점 중에 child */
    child: IGraphNode;
  };
}

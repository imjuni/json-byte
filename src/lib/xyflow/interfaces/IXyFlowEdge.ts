import type { IXyFlowNode } from '#/lib/xyflow/interfaces/IXyFlowNode';

export interface IXyFlowEdge {
  /** Edge 각 정점의 id 값을 hypen으로 연결한 edge id */
  id: string;

  /** 자식 객체 key 값. Edge label */
  label: string;

  /** Source node id */
  source: string;

  /** Target node id */
  target: string;

  /** 데이터 */
  data: {
    /** Edge 정점 중에 parent */
    parent: IXyFlowNode;

    /** Edge 정점 중에 child */
    child: IXyFlowNode;
  };
}

import type { JsonValue } from 'type-fest';

export type TNodeType = 'object' | 'array';

export interface IPrimitiveField {
  key: string;
  value: JsonValue;
  type: 'string' | 'number' | 'boolean' | 'null';
}

export interface IComplexField {
  key: string;
  type: 'object' | 'array';
  size: number; // object의 경우 key 개수, array의 경우 item 개수
  nodeId: string; // 연결된 노드의 id
}

export interface IXyFlowNode {
  /** JSONPath를 사용한 id 값 */
  id: string;

  /** 노드 타입 */
  type?: string;

  /** 드래그 가능 여부. false로 기본 설정된다 */
  draggable: boolean;

  /** XYFlow position */
  position: { x: number; y: number };

  data: {
    /** 현재 key 값, XyFlow에서 이름이 된다 */
    label: string;

    /** 원본 데이터 값 */
    origin: JsonValue;

    /** 노드의 데이터 타입 (object 또는 array만) */
    nodeType: TNodeType;

    /** Primitive 타입 필드들 (노드 내부에 표시) */
    primitiveFields: IPrimitiveField[];

    /** Complex 타입 필드들 (별도 노드로 연결) */
    complexFields: IComplexField[];

    /** 자식 객체 */
    _children: IXyFlowNode[];

    /** 부모 객체 */
    _parent: IXyFlowNode | undefined;
  };
}

// export type IXyFlowNode = NodeTypes;

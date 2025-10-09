import type { JsonValue } from 'type-fest';

import type { TComplexTypeString } from '#/contracts/json/TComplexTypeString';
import type { IComplexField } from '#/lib/xyflow/interfaces/IComplexField';
import type { IPrimitiveField } from '#/lib/xyflow/interfaces/IPrimitiveField';

export interface IXyFlowNode {
  /** JSONPath를 사용한 id 값 */
  id: string;

  /** 노드 타입 */
  type?: string;

  /** 드래그 가능 여부. false로 기본 설정된다 */
  draggable: boolean;

  /** XYFlow position */
  position: { x: number; y: number };

  /** Optional width (can be set manually or by measured) */
  width?: number;

  /** Optional height (can be set manually or by measured) */
  height?: number;

  /** React Flow measured dimensions (available after rendering) */
  measured?: {
    width: number;
    height: number;
  };

  data: {
    /** 현재 key 값, XyFlow에서 이름이 된다 */
    label: string;

    /** 원본 데이터 값 */
    origin: JsonValue;

    /** 노드의 데이터 타입 (object 또는 array만) */
    nodeType: TComplexTypeString;

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

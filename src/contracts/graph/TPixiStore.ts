// State
interface IPixiStoreValue {
  /**
   * 타입 별 색상 팔레트
   */
  colors: {
    theme: Record<
      string,
      {
        node: {
          background: string;
          border: string;
          seperator: string;
        };
        type: {
          string: string;
          boolean: string;
          number: string;
          null: string;
          object: string;
          array: string;
        };
      }
    >;
  };

  size: {
    /** height는 동적 계산에 의해서 적용 */
    node: {
      /** 노드 기본 width */
      width: number;
      /** 노드 border width */
      border: number;
    };
    field: {
      lineHeight: number;
      border: number;
    };
  };
}

// Actions
interface IPixiStoreAction {
  setEditorWidthPercent: (percent: number) => void;
  setEditorHeightPercent: (percent: number) => void;
}

export type TPixiStore = IPixiStoreValue & IPixiStoreAction;

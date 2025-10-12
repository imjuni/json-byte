// State
interface IAppStoreValue {
  /**
   * orientation
   *
   * - vertical
   * - horizontal
   */
  orientation: 'vertical' | 'horizontal';
  editorWidthPercent: number; // Desktop: editor width percentage (0-100)
  editorHeightPercent: number; // Mobile: editor height percentage (0-100)
}

// Actions
interface IAppStoreAction {
  setEditorWidthPercent: (percent: number) => void;
  setEditorHeightPercent: (percent: number) => void;
}

export type TAppStore = IAppStoreValue & IAppStoreAction;

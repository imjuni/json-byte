import { create } from 'zustand';

import type { TAppStore } from '#/contracts/app/TAppStore';

export const useAppStore = create<TAppStore>((set) => ({
  orientation: 'horizontal',
  editorWidthPercent: 30, // Default: 30% for editor, 70% for graph
  editorHeightPercent: 33, // Default: 33% for editor, 67% for graph

  setEditorWidthPercent: (percent) =>
    set(() => ({
      editorWidthPercent: Math.max(10, Math.min(90, percent)),
    })),
  setEditorHeightPercent: (percent) =>
    set(() => ({
      editorHeightPercent: Math.max(10, Math.min(90, percent)),
    })),
}));

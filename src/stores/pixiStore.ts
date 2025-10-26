import { create } from 'zustand';

import type { TPixiStore } from '#/contracts/graph/TPixiStore';

export const usePixiStore = create<TPixiStore>((_set) => ({
  // Initial state - colors
  colors: {
    theme: {
      dark: {
        node: {
          background: '#2a2a2a',
          border: '#444444',
          seperator: '#333333',
        },
        type: {
          string: '#90EE90',
          boolean: '#87CEEB',
          number: '#FFB6C1',
          null: '#D3D3D3',
          object: '#88ccff',
          array: '#ffaa00',
        },
      },
    },
  },

  // Initial state - sizes
  size: {
    node: {
      width: 280,
      border: 2,
    },
    field: {
      lineHeight: 26,
      border: 1,
    },
  },

  // Actions
  setEditorWidthPercent: () => {
    // This action is not used in PixiStore, kept for interface compliance
  },
  setEditorHeightPercent: () => {
    // This action is not used in PixiStore, kept for interface compliance
  },
}));

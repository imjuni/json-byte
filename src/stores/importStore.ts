import { create } from 'zustand';

import type { TImportStore } from '#/contracts/editors/TImportStore';

export const useImportStore = create<TImportStore>()((set) => ({
  // Initial state
  open: false,
  error: undefined,
  isUploading: 'non-dirty',

  // Actions
  setOpen: (open: boolean) => set({ open }),
  setIsUploading: (isUploading: TImportStore['isUploading']) => set({ isUploading }),
  setError: (error?: Error) => set({ error }),
  setFile: (file?: File) => set({ file }),
  reset: () => set({ file: undefined, error: undefined, open: false, isUploading: 'non-dirty' }),
}));

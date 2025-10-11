import { create } from 'zustand';

import type { TImportStore } from '#/contracts/editors/TImportStore';

export const useImportStore = create<TImportStore>()((set) => ({
  // Initial state
  open: false,
  error: undefined,
  isUploading: 'non-dirty',
  isFetching: 'non-dirty',

  // Actions
  setOpen: (open) => set({ open }),
  setIsUploading: (isUploading) => set({ isUploading }),
  setIsFetching: (isFetching) => set({ isFetching }),
  setError: (error) => set({ error }),
  setFile: (file) => set({ file }),
  reset: () =>
    set({
      file: undefined,
      error: undefined,
      open: false,
      isUploading: 'non-dirty',
      isFetching: 'non-dirty',
    }),
}));

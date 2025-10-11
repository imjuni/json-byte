import { create } from 'zustand';

import type { TImportStore } from '#/contracts/editors/TImportStore';

export const useImportStore = create<TImportStore>()((set) => ({
  // Initial state
  open: false,
  error: undefined,
  url: undefined,
  isUploading: 'non-dirty',

  method: 'get',
  isFetching: 'non-dirty',
  headers: [],

  // Actions
  setOpen: (open) => set({ open }),
  setIsUploading: (isUploading) => set({ isUploading }),
  setIsFetching: (isFetching) => set({ isFetching }),
  setError: (error) => set({ error }),
  setFile: (file) => set({ file }),
  setUrl: (url) => set({ url }),
  setMethod: (method) => set({ method }),
  addHeader: (header) =>
    set((state) => ({
      headers: [...state.headers, header],
    })),
  updateHeader: (index, header) =>
    set((state) => ({
      headers: state.headers.map((prev, i) => (i === index ? header : prev)),
    })),
  removeHeader: (index) =>
    set((state) => ({
      headers: state.headers.filter((_, i) => i !== index),
    })),
  reset: () =>
    set({
      file: undefined,
      error: undefined,
      open: false,
      url: undefined,
      isUploading: 'non-dirty',
      isFetching: 'non-dirty',
      headers: [],
    }),
}));

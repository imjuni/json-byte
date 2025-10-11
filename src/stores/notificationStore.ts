import { create } from 'zustand';

import type { TNotificationStore } from '#/contracts/app/TNotificationStore';

export const useNotificationStore = create<TNotificationStore>()((set) => ({
  // Initial state
  open: false,
  title: 'Lorem Ipsum',
  description: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry.',
  kind: 'info',
  autoClose: undefined,

  // Actions
  setOpen: (open) => set({ open }),
  setAutoClose: (autoClose) => set({ autoClose }),
  setTitle: (title) => set({ title }),
  setDescription: (description) => set({ description }),
  setKind: (kind) => set({ kind }),
  setNotification: (notification) => set(notification),
}));

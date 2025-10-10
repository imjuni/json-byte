export const CE_EDITOR_URL = {
  CONTENT: 'c',
} as const;

export type CE_EDITOR_URL = (typeof CE_EDITOR_URL)[keyof typeof CE_EDITOR_URL];

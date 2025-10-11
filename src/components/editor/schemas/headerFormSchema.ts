import { z } from 'zod';

export const headerFormSchema = z.object({
  key: z.string(),
  value: z.string(),
});

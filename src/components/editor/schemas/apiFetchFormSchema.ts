import { z } from 'zod';

import { headerFormSchema } from '#/components/editor/schemas/headerFormSchema';
import { safeParse } from '#/lib/json/safeParse';

export const apiFetchFormSchema = z.object({
  url: z.url('graph.import-dialog.api-fetch-error.invalid-url'),
  headers: z.array(headerFormSchema).optional(),
  method: z.enum(['get', 'delete', 'head', 'options', 'post', 'put', 'patch', 'purge', 'link', 'unlink', 'search']),
  body: z
    .string()
    .max(10000)
    .optional()
    .refine(
      (args) => {
        if (args == null || args === '') {
          return true;
        }

        const parsed = safeParse(args);
        return !(parsed instanceof Error);
      },
      { error: 'graph.import-dialog.api-fetch-error.invalid-json' },
    ),
});

export type TApiFetchFormSchema = z.infer<typeof apiFetchFormSchema>;

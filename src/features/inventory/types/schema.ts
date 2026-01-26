import * as z from 'zod';

export type SearchParamsType = z.infer<typeof SearchParams>;

export const SearchParams = z.object({
  branchId: z.string().optional(),
  product: z.string().optional(),
  showLowStock: z.boolean().optional()
})

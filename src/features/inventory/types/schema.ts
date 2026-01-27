import * as z from 'zod';

export type SearchParamsType = z.infer<typeof SearchParams>;
export type StockMovementFormData = z.infer<typeof StockMovementForm>;

export const SearchParams = z.object({
  branchId: z.string().optional(),
  product: z.string().optional(),
  showLowStock: z.boolean().optional()
})

export const StockMovementForm = z.object({
  inventory_id: z.string(),
  momvement_type: z.string(),
  quantity: z.number(),
  reason: z.string().optional(),
  performed_by: z.string(),
})


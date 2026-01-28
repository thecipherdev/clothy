import * as z from 'zod';

export type SearchParamsType = z.infer<typeof SearchParams>;
export type StockMovementFormData = z.infer<typeof StockMovementForm>;

export const stockMovementFormSchema = z.object({
  quantity: z.string(),
  reason: z.string().optional()
})

export const SearchParams = z.object({
  branchId: z.string().optional(),
  product: z.string().optional(),
  showLowStock: z.boolean().optional()
})

export const StockMovementForm = z.object({
  inventory_id: z.string(),
  momvement_type: z.string(),
  quantity: z.number(),
  reason: z.string().nullable(),
  performed_by: z.string(),
  new_quantity: z.number(),
})


import { z } from 'zod'

export type ProductFormData = z.infer<typeof formSchema>

export type SearchParamsType = z.infer<typeof SearchParams>

export const formSchema = z.object({
  sku: z.string(),
  name: z.string(),
  price: z.string().min(1, 'Make sure you enter product pricing'),
  category_id: z.string(),
  description: z.string(),
  sizes: z.array(z.string()),
  colors: z.array(z.string()),
})

export const IDSchema = z.object({
  id: z.string()
})

export const ProductInputSchema = z.object({
  limit: z.number().min(1).max(100).default(50),
  categoryId: z.string().optional(),
})

export const ProductForm = z.object({
  sku: z.string(),
  name: z.string(),
  description: z.string(),
  price: z.string(),
  category_id: z.string(),
  sizes: z.array(z.string()),
  colors: z.array(z.string()),
})

export const UpdateProductFormData = z.object({
  product: ProductForm,
  editingProduct: z.string(),
})

export const SearchParams = z.object({
  category_id: z.string().optional(),
  prod_sku: z.string().optional(),
})


export interface Category {
  id: string
  name: string
}

export interface Product {
  id: string
  sku: string
  name: string
  description: string | null
  price: number
  category_id: string | null
  is_active: boolean
  created_at: string
  categories: Category | null
}

export interface ProductVariant {
  id: string
  size: string
  color: string
  inventory: Array<{
    quantity: number
    branch: { name: string }
  }>
}

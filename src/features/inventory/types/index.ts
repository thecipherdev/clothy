export interface Branch {
  id: string
  name: string
}

export interface InventoryItem {
  id: string
  quantity: number
  low_stock_threshold: number
  branch: { id: string; name: string }
  variant: {
    id: string
    size: string
    color: string
    product: { id: string; name: string; sku: string }
  }
}

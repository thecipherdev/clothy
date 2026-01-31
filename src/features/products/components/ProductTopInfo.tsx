import type { Product } from '../types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface ProductTopInfoProps {
  product: Product
}

export function ProductTopInfo({ product }: ProductTopInfoProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl">{product.name}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              SKU: {product.sku}
            </p>
          </div>
          <Badge>{product.categories?.name || 'Uncategorized'}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Price</p>
            <p className="text-lg font-semibold">${product.price.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Description
            </p>
            <p className="text-sm">{product.description || 'No description'}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

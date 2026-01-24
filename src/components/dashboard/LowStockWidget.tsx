import { AlertTriangle } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface LowStockItem {
  product_name: string
  variant: string
  branch: string
  quantity: number
  threshold: number
}

interface LowStockWidgetProps {
  items: Array<LowStockItem>
}

export function LowStockWidget({ items }: LowStockWidgetProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-destructive" />
          Low Stock Items
        </CardTitle>
        {items.length > 0 && (
          <Link
            to="/inventory?filter=low-stock"
            className="text-sm text-primary hover:underline"
          >
            View all
          </Link>
        )}
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            All stock levels healthy
          </p>
        ) : (
          <div className="space-y-3">
            {items.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between text-sm"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium truncate">{item.product_name}</p>
                  <p className="text-muted-foreground text-xs truncate">
                    {item.variant} • {item.branch}
                  </p>
                </div>
                <div className="ml-4 text-right shrink-0">
                  <span className="text-destructive font-semibold">
                    {item.quantity}
                  </span>
                  <span className="text-muted-foreground">
                    {' '}
                    / {item.threshold}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

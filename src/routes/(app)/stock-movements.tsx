import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { ArrowLeftRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { supabase } from '@/integrations/supabase/client'

interface StockMovement {
  id: string
  movement_type: string
  quantity: number
  reason: string | null
  created_at: string
  inventory: {
    branch: { name: string }
    variant: {
      size: string
      color: string
      product: { name: string; sku: string }
    }
  }
}

export const Route = createFileRoute('/(app)/stock-movements')({
  component: RouteComponent,
})

function RouteComponent() {
  const [movements, setMovements] = useState<Array<StockMovement>>([])
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState<string>('all')

  useEffect(() => {
    fetchMovements()
  }, [])

  async function fetchMovements() {
    try {
      const { data, error } = await supabase
        .from('stock_movements')
        .select(
          `
          id,
          movement_type,
          quantity,
          reason,
          created_at,
          inventory(
            branch:branches(name),
            variant:product_variants(
              size,
              color,
              product:products(name, sku)
            )
          )
        `,
        )
        .order('created_at', { ascending: false })
        .limit(100)

      if (error) throw error
      setMovements(data || [])
    } catch (error) {
      console.error('Error fetching movements:', error)
      toast.error('Failed to load stock movements')
    } finally {
      setLoading(false)
    }
  }

  const getMovementTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      in: 'Stock In',
      out: 'Stock Out',
      transfer_in: 'Transfer In',
      transfer_out: 'Transfer Out',
      adjustment: 'Adjustment',
    }
    return labels[type] || type
  }

  const getMovementBadgeVariant = (
    type: string,
  ): 'default' | 'destructive' | 'secondary' => {
    if (type === 'in' || type === 'transfer_in') return 'default'
    if (type === 'out' || type === 'transfer_out') return 'destructive'
    return 'secondary'
  }

  const filteredMovements = movements.filter(
    (m) => filterType === 'all' || m.movement_type === filterType,
  )

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <ArrowLeftRight className="h-4 w-4" />
            Movement History
          </CardTitle>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="in">Stock In</SelectItem>
              <SelectItem value="out">Stock Out</SelectItem>
              <SelectItem value="transfer_in">Transfer In</SelectItem>
              <SelectItem value="transfer_out">Transfer Out</SelectItem>
              <SelectItem value="adjustment">Adjustment</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        ) : filteredMovements.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <ArrowLeftRight className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No stock movements recorded yet.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Variant</TableHead>
                <TableHead>Branch</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Reason</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMovements.map((movement) => (
                <TableRow key={movement.id}>
                  <TableCell className="text-sm">
                    {new Date(movement.created_at).toLocaleDateString()}
                    <br />
                    <span className="text-muted-foreground text-xs">
                      {new Date(movement.created_at).toLocaleTimeString()}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">
                        {movement.inventory?.variant?.product?.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {movement.inventory?.variant?.product?.sku}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Badge variant="outline">
                        {movement.inventory?.variant?.size}
                      </Badge>
                      <Badge variant="outline">
                        {movement.inventory?.variant?.color}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>{movement.inventory?.branch?.name}</TableCell>
                  <TableCell>
                    <Badge
                      variant={getMovementBadgeVariant(movement.movement_type)}
                    >
                      {getMovementTypeLabel(movement.movement_type)}
                    </Badge>
                  </TableCell>
                  <TableCell
                    className={`font-medium ${
                      movement.movement_type.includes('in')
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}
                  >
                    {movement.movement_type.includes('in') ? '+' : ''}
                    {movement.quantity}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {movement.reason || '-'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}

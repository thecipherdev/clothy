import { createFileRoute, useNavigate  } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Eye, Loader2, Plus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { supabase } from '@/integrations/supabase/client'

interface PurchaseOrder {
  id: string
  order_number: string
  status: string
  order_date: string | null
  expected_delivery: string | null
  total_amount: number
  created_at: string
  supplier: { id: string; name: string }
  branch: { id: string; name: string }
}

export const Route = createFileRoute('/(app)/purchase-orders/')({
  component: RouteComponent,
})

function RouteComponent() {
  const navigate = useNavigate()
  const [orders, setOrders] = useState<Array<PurchaseOrder>>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from('purchase_orders')
      .select(
        `
        id,
        order_number,
        status,
        order_date,
        expected_delivery,
        total_amount,
        created_at,
        supplier:suppliers(id, name),
        branch:branches(id, name)
      `,
      )
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching orders:', error)
      toast.error('Failed to load purchase orders')
    } else {
      setOrders(data as unknown as Array<PurchaseOrder>)
    }
    setLoading(false)
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<
      string,
      'default' | 'secondary' | 'destructive' | 'outline'
    > = {
      draft: 'secondary',
      ordered: 'default',
      partial: 'outline',
      received: 'outline',
      cancelled: 'destructive',
    }
    const labels: Record<string, string> = {
      draft: 'Draft',
      ordered: 'Ordered',
      partial: 'Partial',
      received: 'Received',
      cancelled: 'Cancelled',
    }
    return (
      <Badge variant={variants[status] || 'secondary'}>
        {labels[status] || status}
      </Badge>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Purchase Orders</CardTitle>
        <Button
          onClick={() =>
            navigate({
              to: '/purchase-orders/$orderId',
              params: { orderId: 'new' },
            })
          }
        >
          <Plus className="h-4 w-4 mr-2" />
          New Order
        </Button>
      </CardHeader>
      <CardContent>
        {orders.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No purchase orders found. Create your first order to restock
            inventory.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order #</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Branch</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Order Date</TableHead>
                <TableHead>Total</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">
                    {order.order_number}
                  </TableCell>
                  <TableCell>{order.supplier.name}</TableCell>
                  <TableCell>{order.branch.name}</TableCell>
                  <TableCell>{getStatusBadge(order.status)}</TableCell>
                  <TableCell>
                    {order.order_date
                      ? new Date(order.order_date).toLocaleDateString()
                      : '-'}
                  </TableCell>
                  <TableCell>
                    ${Number(order.total_amount).toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        navigate({ to: `/purchase-orders/${order.id}` })
                      }
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
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

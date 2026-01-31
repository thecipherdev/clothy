import { useEffect, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'

interface DashboardStats {
  totalProducts: number
  totalBranches: number
  lowStockItems: number
  pendingOrders: number
  nextDelivery: string | null
}

interface LowStockItem {
  product_name: string
  variant: string
  branch: string
  quantity: number
  threshold: number
}

interface RecentMovement {
  id: string
  movement_type: string
  quantity: number
  product_name: string
  created_at: string
}

interface PendingOrder {
  id: string
  order_number: string
  supplier_name: string
  expected_delivery: string | null
  total_amount: number
  status: string
}

export function useDashboardData() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalBranches: 0,
    lowStockItems: 0,
    pendingOrders: 0,
    nextDelivery: null,
  })
  const [lowStockItems, setLowStockItems] = useState<Array<LowStockItem>>([])
  const [recentMovements, setRecentMovements] = useState<Array<RecentMovement>>(
    [],
  )
  const [pendingOrders, setPendingOrders] = useState<Array<PendingOrder>>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        // Parallel fetch all data
        const [
          { count: productCount },
          { count: branchCount },
          { data: lowStock },
          { data: movements },
          { data: orders },
        ] = await Promise.all([
          supabase.from('products').select('*', { count: 'exact', head: true }),
          supabase.from('branches').select('*', { count: 'exact', head: true }),
          supabase
            .from('inventory')
            .select(
              `
            quantity,
            low_stock_threshold,
            branch:branches(name),
            variant:product_variants(
              size,
              color,
              product:products(name)
            )
          `,
            )
            .lt('quantity', 100), // Fetch candidates, filter in JS
          supabase
            .from('stock_movements')
            .select(
              `
            id,
            movement_type,
            quantity,
            created_at,
            inventory:inventory(
              variant:product_variants(
                product:products(name)
              )
            )
          `,
            )
            .order('created_at', { ascending: false })
            .limit(5),
          supabase
            .from('purchase_orders')
            .select(
              `
            id,
            order_number,
            expected_delivery,
            total_amount,
            status,
            supplier:suppliers(name)
          `,
            )
            .in('status', ['draft', 'ordered', 'partial'])
            .order('expected_delivery', { ascending: true, nullsFirst: false })
            .limit(5),
        ])

        // Process low stock items
        const lowStockFiltered = (lowStock || []).filter(
          (item: any) => item.quantity < item.low_stock_threshold,
        )

        const mappedLowStock: Array<LowStockItem> = lowStockFiltered.map(
          (item: any) => ({
            product_name: item.variant?.product?.name || 'Unknown',
            variant: `${item.variant?.size} / ${item.variant?.color}`,
            branch: item.branch?.name || 'Unknown',
            quantity: item.quantity,
            threshold: item.low_stock_threshold,
          }),
        )

        // Process recent movements
        const mappedMovements: Array<RecentMovement> = (movements || []).map(
          (m: any) => ({
            id: m.id,
            movement_type: m.movement_type,
            quantity: m.quantity,
            product_name: m.inventory?.variant?.product?.name || 'Unknown',
            created_at: m.created_at,
          }),
        )

        // Process pending orders
        const mappedOrders: Array<PendingOrder> = (orders || []).map(
          (o: any) => ({
            id: o.id,
            order_number: o.order_number,
            supplier_name: o.supplier?.name || 'Unknown',
            expected_delivery: o.expected_delivery,
            total_amount: o.total_amount,
            status: o.status,
          }),
        )

        // Find next delivery date
        const nextDelivery =
          mappedOrders.find((o) => o.expected_delivery)?.expected_delivery ||
          null

        setStats({
          totalProducts: productCount || 0,
          totalBranches: branchCount || 0,
          lowStockItems: mappedLowStock.length,
          pendingOrders: mappedOrders.length,
          nextDelivery,
        })

        setLowStockItems(mappedLowStock.slice(0, 5))
        setRecentMovements(mappedMovements)
        setPendingOrders(mappedOrders)
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  return {
    stats,
    lowStockItems,
    recentMovements,
    pendingOrders,
    loading,
  }
}

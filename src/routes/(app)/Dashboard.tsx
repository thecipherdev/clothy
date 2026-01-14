import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Package, Store, AlertTriangle, ArrowLeftRight } from 'lucide-react';

interface DashboardStats {
  totalProducts: number;
  totalBranches: number;
  lowStockItems: number;
  recentMovements: number;
}

interface LowStockItem {
  product_name: string;
  variant: string;
  branch: string;
  quantity: number;
  threshold: number;
}

interface RecentMovement {
  id: string;
  movement_type: string;
  quantity: number;
  product_name: string;
  created_at: string;
}


export const Route = createFileRoute('/(app)/dashboard')({
  component: RouteComponent,
})

function RouteComponent() {

  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalBranches: 0,
    lowStockItems: 0,
    recentMovements: 0,
  });
  const [lowStockItems, setLowStockItems] = useState<LowStockItem[]>([]);
  const [recentMovements, setRecentMovements] = useState<RecentMovement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        // Fetch product count
        const { count: productCount } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true });


        console.log('[PRODUCT COUNT] -', productCount)

        // Fetch branch count
        const { count: branchCount } = await supabase
          .from('branches')
          .select('*', { count: 'exact', head: true });

        // Fetch low stock items
        const { data: lowStock } = await supabase
          .from('inventory')
          .select(`
            quantity,
            low_stock_threshold,
            branch:branches(name),
            variant:product_variants(
              size,
              color,
              product:products(name)
            )
          `)

        // Filter low stock items where quantity < threshold
        const lowStockFiltered = (lowStock || []).filter(
          (item: any) => item.quantity < item.low_stock_threshold
        );

        const mappedLowStock: LowStockItem[] = lowStockFiltered.map((item: any) => ({
          product_name: item.variant?.product?.name || 'Unknown',
          variant: `${item.variant?.size} / ${item.variant?.color}`,
          branch: item.branch?.name || 'Unknown',
          quantity: item.quantity,
          threshold: item.low_stock_threshold,
        }));

        // Fetch recent movements
        const { data: movements } = await supabase
          .from('stock_movements')
          .select(`
            id,
            movement_type,
            quantity,
            created_at,
            inventory:inventory(
              variant:product_variants(
                product:products(name)
              )
            )
          `)
          .order('created_at', { ascending: false })
          .limit(5);

        const mappedMovements: RecentMovement[] = (movements || []).map((m: any) => ({
          id: m.id,
          movement_type: m.movement_type,
          quantity: m.quantity,
          product_name: m.inventory?.variant?.product?.name || 'Unknown',
          created_at: m.created_at,
        }));

        setStats({
          totalProducts: productCount || 0,
          totalBranches: branchCount || 0,
          lowStockItems: mappedLowStock.length,
          recentMovements: movements?.length || 0,
        });

        setLowStockItems(mappedLowStock.slice(0, 5));
        setRecentMovements(mappedMovements);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  const getMovementTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      in: 'Stock In',
      out: 'Stock Out',
      transfer_in: 'Transfer In',
      transfer_out: 'Transfer Out',
      adjustment: 'Adjustment',
    };
    return labels[type] || type;
  };

  const getMovementTypeColor = (type: string) => {
    if (type === 'in' || type === 'transfer_in') return 'text-green-600';
    if (type === 'out' || type === 'transfer_out') return 'text-red-600';
    return 'text-amber-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Branches</CardTitle>
            <Store className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalBranches}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.lowStockItems}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Recent Movements</CardTitle>
            <ArrowLeftRight className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.recentMovements}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Low Stock Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Low Stock Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            {lowStockItems.length === 0 ? (
              <p className="text-sm text-muted-foreground">No low stock items</p>
            ) : (
              <div className="space-y-3">
                {lowStockItems.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm">
                    <div>
                      <p className="font-medium">{item.product_name}</p>
                      <p className="text-muted-foreground text-xs">
                        {item.variant} • {item.branch}
                      </p>
                    </div>
                    <span className="text-red-600 font-medium">
                      {item.quantity} / {item.threshold}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Movements */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Stock Movements</CardTitle>
          </CardHeader>
          <CardContent>
            {recentMovements.length === 0 ? (
              <p className="text-sm text-muted-foreground">No recent movements</p>
            ) : (
              <div className="space-y-3">
                {recentMovements.map((movement) => (
                  <div key={movement.id} className="flex items-center justify-between text-sm">
                    <div>
                      <p className="font-medium">{movement.product_name}</p>
                      <p className="text-muted-foreground text-xs">
                        {new Date(movement.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={getMovementTypeColor(movement.movement_type)}>
                        {movement.movement_type.includes('in') ? '+' : '-'}
                        {movement.quantity}
                      </span>
                      <p className="text-muted-foreground text-xs">
                        {getMovementTypeLabel(movement.movement_type)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

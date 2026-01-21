import { createFileRoute } from "@tanstack/react-router";
import { useDashboardData } from "@/hooks/useDashboardData";
import {
  Package,
  Store,
  AlertTriangle,
  ClipboardList
} from 'lucide-react'
import { StatCard } from "@/components/dashboard/StatCard";
import { LowStockWidget } from "@/components/dashboard/LowStockWidget";
import { RecentMovementsWidget } from "@/components/dashboard/RecentMovementWidget";
import { PendingOrdersWidget } from "@/components/dashboard/PendingOrdersWidget";


export const Route = createFileRoute('/(app)/dashboard')({
  component: RouteComponent,
})

function RouteComponent() {
  const { stats, lowStockItems, recentMovements, pendingOrders, loading } = useDashboardData();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Products"
          value={stats.totalProducts}
          icon={Package}
          href="/products"
        />
        <StatCard
          title="Branches"
          value={stats.totalBranches}
          icon={Store}
          href="/branches"
        />
        <StatCard
          title="Low Stock Alerts"
          value={stats.lowStockItems}
          icon={AlertTriangle}
          href="/inventory?filter=low-stock"
          variant={stats.lowStockItems > 0 ? 'warning' : 'default'}
        />
        <StatCard
          title="Pending Orders"
          value={stats.pendingOrders}
          icon={ClipboardList}
          href="/purchase-orders"
          subtitle={stats.nextDelivery ? `Next: ${new Date(stats.nextDelivery).toLocaleDateString()}` : undefined}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <LowStockWidget items={lowStockItems} />
        <RecentMovementsWidget movements={recentMovements} />
      </div>

      <PendingOrdersWidget orders={pendingOrders} />
    </div>
  )
}

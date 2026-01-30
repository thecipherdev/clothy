import { createFileRoute, useNavigate  } from '@tanstack/react-router'
import { ArrowLeftRight, BarChart3, DollarSign, HeartPulse } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useReportsData } from '@/hooks/useReportsData'
import { OverviewTab } from '@/components/reports/OverviewTab'
import { InventoryHealthTab } from '@/components/reports/InventoryHealthTab'
import { InventoryValueTab } from '@/components/reports/InventoryValueTab'
import { StockMovementsTab } from '@/components/reports/StockMovementsTab'

export const Route = createFileRoute('/(app)/reports')({
  component: RouteComponent,
})

function RouteComponent() {
  const navigate = useNavigate({ from: Route.fullPath })
  const {
    branches,
    branchStock,
    categoryStock,
    inventoryHealth,
    stockMovements,
    movementSummary,
    totalInventoryValue,
    loading,
    selectedBranch,
    setSelectedBranch,
    dateRange,
    setDateRange,
  } = useReportsData()

  return (
    <Tabs defaultValue="overview" className="space-y-6">
      <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
        <TabsTrigger value="overview" className="gap-2">
          <BarChart3 className="h-4 w-4 hidden sm:block" />
          Overview
        </TabsTrigger>
        <TabsTrigger value="health" className="gap-2">
          <HeartPulse className="h-4 w-4 hidden sm:block" />
          Inventory Health
        </TabsTrigger>
        <TabsTrigger value="value" className="gap-2">
          <DollarSign className="h-4 w-4 hidden sm:block" />
          Inventory Value
        </TabsTrigger>
        <TabsTrigger value="movements" className="gap-2">
          <ArrowLeftRight className="h-4 w-4 hidden sm:block" />
          Stock Movements
        </TabsTrigger>
      </TabsList>

      <TabsContent value="overview">
        <OverviewTab
          branchStock={branchStock}
          categoryStock={categoryStock}
          loading={loading}
          navigate={navigate}
        />
      </TabsContent>

      <TabsContent value="health">
        <InventoryHealthTab
          inventoryHealth={inventoryHealth}
          branches={branches}
          loading={loading}
        />
      </TabsContent>

      <TabsContent value="value">
        <InventoryValueTab
          branchStock={branchStock}
          categoryStock={categoryStock}
          totalValue={totalInventoryValue}
          loading={loading}
        />
      </TabsContent>

      <TabsContent value="movements">
        <StockMovementsTab
          movements={stockMovements}
          summary={movementSummary}
          branches={branches}
          dateRange={dateRange}
          setDateRange={setDateRange}
          selectedBranch={selectedBranch}
          setSelectedBranch={setSelectedBranch}
          loading={loading}
        />
      </TabsContent>
    </Tabs>
  )
}

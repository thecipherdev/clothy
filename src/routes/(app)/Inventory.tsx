import { createFileRoute } from '@tanstack/react-router'
import { Inventory } from '@/components/pages/Inventory'
import { SearchParams } from '@/features/inventory/types/schema'
import { InventoryProvider } from '@/features/inventory/context/InventoryContext'


export const Route = createFileRoute('/(app)/inventory')({
  validateSearch: SearchParams,
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <InventoryProvider>
      <Inventory />
    </InventoryProvider>
  )
}

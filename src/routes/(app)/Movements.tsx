import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(app)/Movements')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/(app)/StockMovements"!</div>
}

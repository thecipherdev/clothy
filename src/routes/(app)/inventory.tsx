import { createFileRoute } from '@tanstack/react-router'
import * as z from 'zod'
import { Inventory } from '@/components/pages/Inventory'

const querySearchSchema = z.object({
  branchId: z.string().optional(),
})

export const Route = createFileRoute('/(app)/inventory')({
  validateSearch: querySearchSchema,
  component: RouteComponent,
})

function RouteComponent() {
  return (<Inventory />

  )
}

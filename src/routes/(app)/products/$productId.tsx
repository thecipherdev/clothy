import { createFileRoute } from '@tanstack/react-router'
import { ProductDetails } from '@/components/pages/ProductDetails'

export const Route = createFileRoute('/(app)/products/$productId')({
  component: RouteComponent,
})

function RouteComponent() {
  return <ProductDetails />
}

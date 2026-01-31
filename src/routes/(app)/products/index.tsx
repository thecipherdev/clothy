import { createFileRoute } from '@tanstack/react-router'
import { ProductContextProvider } from '@/features/products/context/ProductContext'
import { SearchParams } from '@/features/products/types/schema'
import { ProductPage } from '@/components/pages/Product'

export const Route = createFileRoute('/(app)/products/')({
  validateSearch: SearchParams,
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <ProductContextProvider>
      <ProductPage />
    </ProductContextProvider>
  )
}

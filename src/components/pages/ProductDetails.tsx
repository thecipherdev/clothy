import { getRouteApi, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { toast } from 'sonner'
import { ArrowLeft, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ProductTopInfo } from '@/features/products/components/ProductTopInfo'
import { useGetProduct, useVariants } from '@/features/products/model/queries'


const Route = getRouteApi('/(app)/products/$productId')

export function ProductDetails() {
  const { productId } = Route.useParams()
  const { data: productData, isLoading: isProductLoading, isError: isProductError } = useGetProduct(productId)
  const { data: variantsData } = useVariants(productId)
  const navigate = useNavigate()

  useEffect(() => {
    if (isProductLoading) return
    if (isProductError || !productData?.data) {
      toast.error('Product not found')
      navigate({
        to: '/products',
      })
      return
    }
  }, [isProductLoading, isProductError, productData, navigate])

  useEffect(() => {
    if (!productData?.data) return
  }, [productData])

  if (isProductLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!productData?.data) {
    return null
  }

  return (
    <div className="flex flex-col gap-4">
      <Button
        className="w-fit ml-auto"
        variant="outline"
        onClick={() =>
          navigate({
            to: '/products',
          })
        }
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back to Products
      </Button>

      <div className="space-y-6">
        <ProductTopInfo product={productData?.data} />
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Package className="h-4 w-4" />
              Variants & Stock
            </CardTitle>
          </CardHeader>
          <CardContent>
            {variantsData?.data.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                No variants configured for this product.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Size</TableHead>
                    <TableHead>Color</TableHead>
                    <TableHead>Stock by Branch</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {variantsData?.data.map((variant) => (
                    <TableRow key={variant.id}>
                      <TableCell>
                        <Badge variant="outline">{variant.size}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{variant.color}</Badge>
                      </TableCell>
                      <TableCell>
                        {variant.inventory.length === 0 ? (
                          <span className="text-muted-foreground text-sm">
                            No stock records
                          </span>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {variant.inventory.map((inv, idx) => (
                              <Badge
                                key={idx}
                                variant={
                                  inv.quantity > 0 ? 'default' : 'secondary'
                                }
                              >
                                {inv.branch.name}: {inv.quantity}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


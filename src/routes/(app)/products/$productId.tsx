import { createFileRoute, useNavigate  } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
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
import { supabase } from '@/integrations/supabase/client'

interface ProductVariant {
  id: string
  size: string
  color: string
  inventory: Array<{
    quantity: number
    branch: { name: string }
  }>
}

interface Product {
  id: string
  sku: string
  name: string
  description: string | null
  price: number
  categories: { name: string } | null
}

export const Route = createFileRoute('/(app)/products/$productId')({
  component: RouteComponent,
})

function RouteComponent() {
  const { productId } = Route.useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState<Product | null>(null)
  const [variants, setVariants] = useState<Array<ProductVariant>>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (productId) {
      fetchProductDetails()
    }
  }, [productId])

  async function fetchProductDetails() {
    try {
      const { data: productData, error: productError } = await supabase
        .from('products')
        .select('*, categories(name)')
        .eq('id', productId)
        .maybeSingle()

      if (productError) throw productError
      if (!productData) {
        toast.error('Product not found')
        navigate({
          to: '/products',
        })
        return
      }

      setProduct(productData)

      const { data: variantData, error: variantError } = await supabase
        .from('product_variants')
        .select(
          `
          id,
          size,
          color,
          inventory(
            quantity,
            branch:branches(name)
          )
        `,
        )
        .eq('product_id', productId)
        .order('size')
        .order('color')

      if (variantError) throw variantError
      setVariants(variantData || [])
    } catch (error) {
      console.error('Error fetching product:', error)
      toast.error('Failed to load product')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!product) {
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
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-xl">{product.name}</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  SKU: {product.sku}
                </p>
              </div>
              <Badge>{product.categories?.name || 'Uncategorized'}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Price
                </p>
                <p className="text-lg font-semibold">
                  ${product.price.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Description
                </p>
                <p className="text-sm">
                  {product.description || 'No description'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Package className="h-4 w-4" />
              Variants & Stock
            </CardTitle>
          </CardHeader>
          <CardContent>
            {variants.length === 0 ? (
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
                  {variants.map((variant) => (
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

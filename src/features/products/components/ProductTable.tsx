import { Link } from '@tanstack/react-router';
import { ShoppingBag, Pencil, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Product } from "../types";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell
} from '@/components/ui/table'

interface ProductTableProps {
  products: Product[] | undefined
  isLoading: boolean;
  handleOpenDialog: (product: Product) => void
}

export function ProductTable({
  products,
  isLoading,
  handleOpenDialog
}: ProductTableProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (products?.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <ShoppingBag className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No products found.</p>
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>SKU</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Price</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="w-[120px]">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {products?.map((product) => (
          <TableRow key={product.id}>
            <TableCell className="font-mono text-sm">
              {product.sku}
            </TableCell>
            <TableCell className="font-medium">
              {product.name}
            </TableCell>
            <TableCell>
              {product.categories?.name || (
                <span className="text-muted-foreground">
                  Uncategorized
                </span>
              )}
            </TableCell>
            <TableCell>${product.price.toFixed(2)}</TableCell>
            <TableCell>
              <Badge
                variant={product.is_active ? 'default' : 'secondary'}
              >
                {product.is_active ? 'Active' : 'Inactive'}
              </Badge>
            </TableCell>
            <TableCell>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" asChild>
                  <Link
                    to="/products/$productId"
                    params={{ productId: product.id }}
                  >
                    <Eye className="h-4 w-4" />
                  </Link>
                </Button>
                {'admin' === 'admin' && (
                  <Button
                    variant="ghost"
                    className="cursor-pointer"
                    size="icon"
                    onClick={() => handleOpenDialog(product)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

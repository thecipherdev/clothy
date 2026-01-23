import { useNavigate, createFileRoute } from '@tanstack/react-router';
import { useAppForm } from '@/components/form/hooks';
import { useEffect, useState } from 'react';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { FieldGroup } from '@/components/ui/field'


import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Plus, Pencil, ShoppingBag, Search, Eye } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { DialogDescription } from '@radix-ui/react-dialog';
import { Product, Category } from '@/features/products/types'
import { formSchema } from '@/features/products/types/schema';
import { useUpdateProduct, useCreateProduct } from '@/features/products/model/mutations';
import { useProducts } from '@/features/products/model/queries';



const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const COLORS = ['Black', 'White', 'Navy', 'Gray', 'Red', 'Blue', 'Green', 'Brown', 'Beige', 'Pink'];


const SearchParams = z.object({
  category_id: z.string().optional(),
  prod_sku: z.string().optional(),
})

type SearchParamsType = z.infer<typeof SearchParams>

export const Route = createFileRoute('/(app)/products/')({
  validateSearch: SearchParams,
  component: RouteComponent,
})


function RouteComponent() {

  const [categories, setCategories] = useState<Category[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<string | null>(null);

  const createProduct = useCreateProduct()
  const updateProduct = useUpdateProduct(editingProduct as string)
  const searchParams = Route.useSearch()
  const navigate = useNavigate({ from: Route.fullPath })
  const { data: products, isLoading } = useProducts()

  const form = useAppForm({
    defaultValues: {
      sku: "",
      price: "",
      name: "",
      category_id: "",
      description: "",
      sizes: [] as string[],
      colors: [] as string[],
    },
    validators: {
      onSubmit: formSchema
    },
    onSubmit: async ({ value }) => {
      try {
        if (editingProduct) {
          updateProduct.mutate(value)
        } else {
          createProduct.mutate(value)
        }
        setIsDialogOpen(false);
      } catch (error: any) {
        console.error('Error saving product:', error);
        toast.error(error.message || 'Failed to save product');
      }
    }
  })

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  }

  const handleOpenDialog = async (product?: Product) => {
    if (product) {
      setEditingProduct(product.id);

      // Fetch existing variants
      const { data: variants } = await supabase
        .from('product_variants')
        .select('size, color')
        .eq('product_id', product.id);

      const sizes = [...new Set(variants?.map((v) => v.size) || [])];
      const colors = [...new Set(variants?.map((v) => v.color) || [])];

      form.setFieldValue('sku', product.sku)
      form.setFieldValue('name', product.name)
      form.setFieldValue('description', product.description || '')
      form.setFieldValue('price', product.price.toString())
      form.setFieldValue('category_id', product.category_id || '')
      form.setFieldValue('sizes', sizes)
      form.setFieldValue('colors', colors)

    } else {
      setEditingProduct(null);
      form.reset();
    }
    setIsDialogOpen(true);
  };

  const filteredProducts = products?.data?.filter((product) => {
    const s = Object.keys(searchParams)

    const matchesSearch =
      product.name.toLowerCase().includes((searchParams.prod_sku || '').toLowerCase()) ||
      product.sku.toLowerCase().includes((searchParams.prod_sku || '').toLowerCase());
    const matchesCategory =
      searchParams.category_id === 'all' || s.length === 0 || product.category_id === searchParams.category_id;
    return matchesSearch && matchesCategory;
  });

  const updateFilter = (name: keyof SearchParamsType, value: unknown) => {
    return navigate({ search: (prev) => ({ ...prev, [name]: value }) })
  }

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <ShoppingBag className="h-4 w-4" />
              All Products
            </CardTitle>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  value={searchParams.prod_sku}
                  onChange={(e) => updateFilter('prod_sku', e.target.value)}
                  className="pl-9 w-[200px]"
                />
              </div>
              <Select value={searchParams.category_id} onValueChange={(value) => (updateFilter("category_id", value))}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem key="all" value="all">All Categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>

                <DialogTrigger asChild>
                  <Button size="sm" className="ml-auto w-fit" onClick={() => handleOpenDialog()}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Product
                  </Button>
                </DialogTrigger>
                <DialogContent
                  className="max-w-2xl max-h-[90vh] overflow-y-auto"
                >
                  <DialogHeader>
                    <DialogTitle>
                      {editingProduct ? 'Edit Product' : 'Add New Product'}
                    </DialogTitle>
                    <DialogDescription className="text-xs text-[#a0a0a0]">
                      Manage your product information
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={(e: React.FormEvent) => {
                    e.preventDefault();
                    form.handleSubmit();
                  }} className="space-y-4">
                    <div className="space-y-4">
                      <FieldGroup className="grid grid-cols-2 gap-4">
                        <form.AppField
                          name="sku"
                          children={(field) => (
                            <field.Input formBaseProps={{ label: "SKU" }} />
                          )}
                        />
                        <form.AppField
                          name="price"
                          children={(field) => (
                            <field.Input formBaseProps={{ label: "Price" }} />
                          )}
                        />
                      </FieldGroup>
                      <form.AppField
                        name="name"
                        children={(field) => (
                          <field.Input formBaseProps={{ label: "Product Name" }} />
                        )}
                      />
                      <form.AppField
                        name="category_id"
                        children={(field) => (
                          <field.Select formBaseProps={{ label: "Category" }} items={categories} placeholder="Select Categories" />
                        )}
                      />
                      <form.AppField
                        name="description"
                        children={(field) => (
                          <field.Textarea formBaseProps={{ label: "Description" }} aria-describedby={field.name} />
                        )}
                      />
                      <form.AppField
                        name="sizes"
                        children={(field) => {
                          const toggleSize = (size: string) => {
                            const currentSize = field.state.value || []
                            const index = currentSize.indexOf(size)

                            if (index > -1) {
                              field.removeValue(index)
                            } else {
                              field.pushValue(size)
                            }
                          }
                          return <field.BadgeSelect label="Sizes" items={SIZES} onClick={toggleSize} />
                        }}

                      />
                      <form.AppField
                        mode="array"
                        name="colors"
                        children={(field) => {
                          const toggleColor = (color: string) => {
                            const currentColors = field.state.value || [];
                            const index = currentColors.indexOf(color)

                            if (index > -1) {
                              field.removeValue(index)
                            } else {
                              field.pushValue(color)
                            }
                          }
                          return <field.BadgeSelect label="Colors" items={COLORS} onClick={toggleColor} />
                        }}
                      />
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button type="submit">
                          {editingProduct ? 'Update' : 'Create'}
                        </Button>
                      </div>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          ) : filteredProducts?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <ShoppingBag className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No products found.</p>
            </div>
          ) : (
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
                {filteredProducts?.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-mono text-sm">{product.sku}</TableCell>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>
                      {product.categories?.name || (
                        <span className="text-muted-foreground">Uncategorized</span>
                      )}
                    </TableCell>
                    <TableCell>${product.price.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge variant={product.is_active ? 'default' : 'secondary'}>
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
          )}
        </CardContent>
      </Card>
    </div>
  )
}


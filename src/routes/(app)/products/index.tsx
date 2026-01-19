import { useRouterState, useRouter, createFileRoute } from '@tanstack/react-router';
import { useForm } from '@tanstack/react-form-start';
import { useEffect, useState } from 'react';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
import { Field, FieldLabel, FieldGroup, FieldError } from '@/components/ui/field'



import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Plus, Pencil, ShoppingBag, Search, Eye } from 'lucide-react';
import { Link } from '@tanstack/react-router';


interface Category {
  id: string;
  name: string;
}

interface Product {
  id: string;
  sku: string;
  name: string;
  description: string | null;
  price: number;
  category_id: string | null;
  is_active: boolean;
  created_at: string;
  categories: Category | null;
}

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const COLORS = ['Black', 'White', 'Navy', 'Gray', 'Red', 'Blue', 'Green', 'Brown', 'Beige', 'Pink'];

const formSchema = z.object({
  sku: z.string(),
  name: z.string(),
  price: z.string().min(1, 'Make sure you enter product pricing'),
  category_id: z.string(),
  description: z.string(),
  sizes: z.array(z.string()),
  colors: z.array(z.string()),
})

export const Route = createFileRoute('/(app)/products/')({
  component: RouteComponent,
  loader: async () => {
    try {
      const { data: products } = await supabase
        .from('products')
        .select('*, categories(*)')
      return { products }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
    return {}
  },
})


function RouteComponent() {
  const router = useRouter()
  const routerState = useRouterState()
  const loading = routerState.status === 'pending'
  const form = useForm({
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
          const { error } = await supabase
            .from('products')
            .update({
              sku: value.sku,
              name: value.name,
              description: value.description || null,
              price: parseFloat(value.price),
              category_id: value.category_id || null,
            })
            .eq('id', editingProduct.id);

          if (error) throw error;

          // Update variants - delete existing and create new
          await supabase
            .from('product_variants')
            .delete()
            .eq('product_id', editingProduct.id);

          if (value.sizes.length > 0 && value.colors.length > 0) {
            const variants = value.sizes.flatMap((size) =>
              value.colors.map((color) => ({
                product_id: editingProduct.id,
                size,
                color,
              }))
            );
            await supabase.from('product_variants').insert(variants);
          }

          toast.success('Product updated successfully');
        } else {
          const { data: newProduct, error } = await supabase
            .from('products')
            .insert({
              sku: value.sku,
              name: value.name,
              description: value.description || null,
              price: parseFloat(value.price),
              category_id: value.category_id || null,
            })
            .select()
            .single();

          if (error) throw error;

          // Create variants
          if (value.sizes.length > 0 && value.colors.length > 0) {
            const variants = value.sizes.flatMap((size) =>
              value.colors.map((color) => ({
                product_id: newProduct.id,
                size,
                color,
              }))
            );
            await supabase.from('product_variants').insert(variants);
          }

          toast.success('Product created successfully');
        }

        setIsDialogOpen(false);
        router.invalidate()
      } catch (error: any) {
        console.error('Error saving product:', error);
        toast.error(error.message || 'Failed to save product');
      }
    }
  })
  const { products } = Route.useLoaderData()
  const [categories, setCategories] = useState<Category[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

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
      setEditingProduct(product);

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

  const filteredProducts = products?.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === 'all' || product.category_id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex flex-col gap-4">
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button className="ml-auto w-fit" onClick={() => handleOpenDialog()}>
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={(e: React.FormEvent) => {
            e.preventDefault();
            form.handleSubmit();
          }} className="space-y-4">
            <Field>
              <FieldGroup className="grid grid-cols-2 gap-4">
                <form.Field
                  name="sku"
                  children={(field) => (
                    <div className="space-y-2">
                      <FieldLabel htmlFor="sku">SKU</FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        required
                      />
                    </div>
                  )}
                />
                <form.Field
                  name="price"
                  children={(field) => {
                    return (
                      <div className="space-y-2">
                        <FieldLabel htmlFor="price">Price</FieldLabel>
                        <Input
                          id={field.name}
                          name={field.name}
                          type="number"
                          step="0.01"
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                        />
                      </div>
                    )
                  }}
                />
              </FieldGroup>
              <form.Field
                name="name"
                children={(field) => {
                  return (
                    <div className="space-y-2">
                      <FieldLabel htmlFor="name">Product Name</FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        required
                      />
                    </div>
                  )
                }}
              />
              <form.Field
                name="category_id"
                children={(field) => {
                  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid} className="space-y-2">
                      <FieldLabel htmlFor="category">Category</FieldLabel>
                      <Select
                        name={field.name}
                        value={field.state.value}
                        onValueChange={field.handleChange}
                      >
                        <SelectTrigger aria-invalid={isInvalid}>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id}>
                              {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {isInvalid && (<FieldError errors={field.state.meta.errors} />)}
                    </Field>

                  )
                }}

              />
              <form.Field
                name="description"
                children={(field) => {
                  return (
                    <Field className="space-y-2">
                      <FieldLabel htmlFor="description">Description</FieldLabel>
                      <Textarea
                        name={field.name}
                        id={field.name}
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        rows={3}
                      />
                    </Field>
                  )
                }}
              />
              <form.Field
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
                  return (
                    <Field className="space-y-2">
                      <FieldLabel>Sizes</FieldLabel>
                      <div className="flex flex-wrap gap-2">
                        {SIZES.map((size) => (
                          <Badge
                            key={size}
                            variant={field.state.value.includes(size) ? 'default' : 'outline'}
                            className="cursor-pointer"
                            onClick={() => toggleSize(size)}
                          >
                            {size}
                          </Badge>
                        ))}
                      </div>
                    </Field>
                  )
                }}

              />
              <form.Field
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
                  return (
                    <Field className="space-y-2">
                      <FieldLabel>Colors</FieldLabel>
                      <div className="flex flex-wrap gap-2">
                        {COLORS.map((color) => (
                          <Badge
                            key={color}
                            variant={field.state.value.includes(color) ? 'default' : 'outline'}
                            className="cursor-pointer"
                            onClick={() => toggleColor(color)}
                          >
                            {color}
                          </Badge>
                        ))}
                      </div>
                    </Field>

                  )
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
            </Field>
          </form>
        </DialogContent>
      </Dialog>
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
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-[200px]"
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
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


import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import type { Product } from '@/features/products/types'
import { useAppForm } from '@/components/form/hooks'
import { Card, CardContent } from '@/components/ui/card'

import { supabase } from '@/integrations/supabase/client'
import { formSchema, UseAppForm } from '@/features/products/types/schema'
import {
  useCreateProduct,
  useUpdateProduct,
} from '@/features/products/model/mutations'
import { useCategories, useProducts } from '@/features/products/model/queries'
import { ProductContextProvider, useProductContext } from '@/features/products/context/ProductContext';
import { SearchParams, SearchParamsType } from '@/features/products/types/schema'
import { useGlobalContext } from '@/context/GlobalContext'
import { ProductToolbar } from '@/features/products/components/ProductToolbar'
import { ProductTable } from '@/features/products/components/ProductTable'

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL']
const COLORS = [
  'Black',
  'White',
  'Navy',
  'Gray',
  'Red',
  'Blue',
  'Green',
  'Brown',
  'Beige',
  'Pink',
]

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


function ProductPage() {
  const searchParams = Route.useSearch()
  const navigate = useNavigate({ from: Route.fullPath })

  const { editingProduct, setEditingProduct } = useProductContext()
  const { setIsDialogOpen } = useGlobalContext()

  const createProduct = useCreateProduct()
  const updateProduct = useUpdateProduct(editingProduct as string)
  const { data: products, isLoading } = useProducts()
  const { data: categories } = useCategories()

  const form = useAppForm({
    defaultValues: {
      sku: '',
      price: '',
      name: '',
      category_id: '',
      description: '',
      sizes: [] as Array<string>,
      colors: [] as Array<string>,
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        if (editingProduct) {
          updateProduct.mutate(value)
        } else {
          createProduct.mutate(value)
        }
        setIsDialogOpen(false)
      } catch (error: any) {
        console.error('Error saving product:', error)
        toast.error(error.message || 'Failed to save product')
      }
    },
  })

  const handleOpenDialog = async (product?: Product) => {
    if (product) {
      setEditingProduct(product.id)

      console.log('editing', product)
      // Fetch existing variants
      const { data: variants } = await supabase
        .from('product_variants')
        .select('size, color')
        .eq('product_id', product.id)

      const sizes = [...new Set(variants?.map((v) => v.size) || [])]
      const colors = [...new Set(variants?.map((v) => v.color) || [])]

      form.setFieldValue('sku', product.sku)
      form.setFieldValue('name', product.name)
      form.setFieldValue('description', product.description || '')
      form.setFieldValue('price', product.price.toString())
      form.setFieldValue('category_id', product.category_id || '')
      form.setFieldValue('sizes', sizes)
      form.setFieldValue('colors', colors)
    } else {
      setEditingProduct(null)
      form.reset()
    }
    setIsDialogOpen(true)
  }

  const filteredProducts = products?.data?.filter((product) => {
    const searchTerm = searchParams.prod_sku?.toLowerCase()
    const matchesSearch = !searchTerm ||
      product.name.toLowerCase().includes(searchTerm) ||
      product.sku.toLowerCase().includes(searchTerm)
    const matchesCategory =
      !searchParams.category_id ||
      searchParams.category_id === 'all' ||
      product.category_id === searchParams.category_id
    return matchesSearch && matchesCategory
  })

  const updateFilter = (name: keyof SearchParamsType, value: unknown) => {
    return navigate({
      search: (prev) => ({
        ...prev,
        [name]: (!value || value === '' || value === 'all') ? undefined : value
      })
    })
  }

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <ProductToolbar
          searchParams={searchParams}
          categories={categories?.data}
          updateFilter={updateFilter}
          handleOpenDialog={handleOpenDialog}
          sizes={SIZES}
          colors={COLORS}
          form={form as unknown as UseAppForm}
        />
        <CardContent>
          <ProductTable
            products={filteredProducts}
            isLoading={isLoading}
            handleOpenDialog={handleOpenDialog}
          />
        </CardContent>
      </Card>
    </div>
  )
}

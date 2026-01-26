import { getRouteApi } from '@tanstack/react-router'
import { toast } from 'sonner'
import { supabase } from '@/integrations/supabase/client'

import { useAppForm } from '@/components/form/hooks'
import { Card, CardContent } from '@/components/ui/card'

import { ProductToolbar } from '@products/components/ProductToolbar'
import { ProductTable } from '@products/components/ProductTable'

import {
  useCreateProduct,
  useUpdateProduct,
} from '@products/model/mutations'
import { useCategories, useProducts } from '@products/model/queries'

import { formSchema, UseAppForm } from '@products/types/schema'
import type { Product } from '@products/types'
import { useProductContext } from '@products/context/ProductContext';

import { useGlobalContext } from '@/context/GlobalContext'

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

const Route = getRouteApi("/(app)/products/")

export function ProductPage() {
  const searchParams = Route.useSearch()

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

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <ProductToolbar
          searchParams={searchParams}
          categories={categories?.data}
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

import { createServerFn } from '@tanstack/react-start'
import { setResponseStatus } from '@tanstack/react-start/server'
import { IDSchema, ProductInputSchema } from '../types/schema'
import { supabase } from '@/integrations/supabase/client'

export const getVariantsData = createServerFn({ method: 'GET' })
  .inputValidator(IDSchema)
  .handler(async ({ data }) => {
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
      .eq('product_id', data.id)
      .order('size')
      .order('color')

    if (variantError) {
      console.log('Database Error:', variantError)
      setResponseStatus(500)
      throw new Error('Failed to fetch products')
    }
    return { data: variantData }
  })

export const getProductData = createServerFn({ method: 'GET' })
  .inputValidator(IDSchema)
  .handler(async ({ data }) => {
    const { data: productData, error: productError } = await supabase
      .from('products')
      .select('*, categories(id, name)')
      .eq('id', data.id)
      .maybeSingle()

    if (productError) {
      console.log('Database Error:', productError)
      setResponseStatus(500)
      throw new Error('Failed to fetch products')
    }

    return { data: productData }
  })

export const getProductsData = createServerFn({ method: 'GET' })
  .inputValidator(ProductInputSchema)
  .handler(async ({ data: input }) => {
    let query = supabase
      .from('products')
      .select('*, categories(*)')
      .limit(input.limit)

    if (input.categoryId) {
      query = query.eq('category_id', input.categoryId)
    }

    const { data: products, error } = await query

    if (error) {
      console.error('Database Error:', error)
      setResponseStatus(500)
      throw new Error('Failed to fetch products')
    }
    return { data: products }
  })

export const getCategoriesData = createServerFn({ method: 'GET' }).handler(
  async () => {
    const { data: categories, error } = await supabase
      .from('categories')
      .select('id, name')
      .order('name')

    if (error) {
      console.error('Database Error:', error)
      setResponseStatus(500)
      throw new Error('Failed to fetch categories')
    }

    return { data: categories }
  },
)

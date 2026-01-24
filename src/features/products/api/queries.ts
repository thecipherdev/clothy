import { createServerFn } from '@tanstack/react-start'
import { setResponseStatus } from '@tanstack/react-start/server'
import { ProductInputSchema } from '../types/schema'
import { supabase } from '@/integrations/supabase/client'

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


export const getCategoriesData = createServerFn({ method: 'GET' })
  .handler(async () => {
    let { data: categories, error } = await supabase
      .from('categories')
      .select('id, name')
      .order('name')


    if (error) {
      console.error('Database Error:', error)
      setResponseStatus(500)
      throw new Error('Failed to fetch categories')
    }

    return { data: categories }
  })

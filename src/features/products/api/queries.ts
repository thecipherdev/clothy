import { createServerFn } from "@tanstack/react-start"
import { setResponseStatus } from "@tanstack/react-start/server"
import { supabase } from "@/integrations/supabase/client"
import { ProductInputSchema } from '../types/schema';

export const getProductsData = createServerFn({ method: "GET" })
  .inputValidator(ProductInputSchema)
  .handler(async ({ data: input }) => {
    console.log('data', input)
    let query = supabase
      .from('products')
      .select('*, categories(*)')
      .limit(input.limit)

    if (input.categoryId) {
      query = query.eq('category_id', input.categoryId)
    }

    const { data: products, error } = await query;


    if (error) {
      console.error('Database Error:', error)
      setResponseStatus(500)
      throw new Error('Failed to fetch products')
    }
    return { data: products }
  })



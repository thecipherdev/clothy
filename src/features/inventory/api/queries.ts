import { createServerFn } from '@tanstack/react-start'
import { setResponseStatus } from '@tanstack/react-start/server'

import { supabase } from '@/integrations/supabase/client'

export const getBranchesData = createServerFn({ method: 'GET' })
  .handler(async () => {
    const { data, error } = await supabase
      .from('branches')
      .select('id, name')
      .eq('is_active', true)
      .order('name')

    if (error) {
      console.error('Database Error:', error)
      setResponseStatus(500)
      throw new Error('Failed to fetch branches')
    }

    return { data }
  })


export const getInventoryData = createServerFn({ method: 'GET' })
  .handler(async () => {
    const { data, error } = await supabase
      .from('inventory')
      .select(
        `
          id,
          quantity,
          low_stock_threshold,
          branch:branches(id, name),
          variant:product_variants(
            id,
            size,
            color,
            product:products(id, name, sku)
          )
        `,
      )
      .order('quantity')

    if (error) {
      console.error('Database Error:', error)
      setResponseStatus(500)
      throw new Error('Failed to fetch branches')
    }

    return { data }
  })


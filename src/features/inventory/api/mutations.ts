import { createServerFn } from '@tanstack/react-start'
import { StockMovementForm } from '../types/schema'
import { supabase } from '@/integrations/supabase/client'

export const createMovement = createServerFn({ method: 'POST' })
  .inputValidator(StockMovementForm)
  .handler(async ({ data }) => {
    const { error } = await supabase.rpc('inventory_adjustment', {
      p_new_qty: data.new_quantity,
      p_inventory_id: data.inventory_id,
      p_movement_qty: data.quantity,
      p_performed_by: '2214933b-7c33-480e-9177-5b53a1e8d2d0',
      p_movement_type: data.momvement_type,
      p_reason: data.reason || '',
    })

    if (error) {
      console.error('Create Error:', error)
      throw new Error(error.message)
    }

    return { success: true }
  })

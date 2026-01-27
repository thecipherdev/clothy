import { supabase } from '@/integrations/supabase/client'
import { createServerFn } from '@tanstack/react-start'
import { StockMovementForm } from '../types/schema'

export const createMovement = createServerFn({ method: 'POST' })
  .inputValidator(StockMovementForm)
  .handler(async ({ data }) => {
    const { data: stockMovement, error: movementError } = await supabase
      .from('stock_movements')
      .insert({
        inventory_id: data.inventory_id,
        movement_type: data.momvement_type,
        quantity: data.quantity,
        reason: data.reason || null,
        performed_by: '2214933b-7c33-480e-9177-5b53a1e8d2d0',
      })

    if (movementError) {
      console.error('Create Error:', movementError)
      throw new Error(movementError.message)
    }

    return { success: true, id: stockMovement }
  })



import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from 'sonner';
import { createMovement } from "../api/mutations";
import { StockMovementFormData } from '../types/schema';


export const useStockAdjustment = (adjustmentType: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (stock: StockMovementFormData) => (
      createMovement({
        data: stock
      })
    ),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['inventory'] })
      toast.success(
        `Stock ${adjustmentType === 'in' ? 'added' : 'removed'} successfully`,
      )
    },
    onError: (error) => {
      console.log(error)
      toast.error(error.message || 'Failed to adjust stock')
    }
  })
}

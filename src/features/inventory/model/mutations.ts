import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from 'sonner';
import { createMovement } from "../api/mutations";
import { StockMovementFormData } from '../types/schema';


export const useRecordMovement = () => {
  const queryClient = useQueryClient()


  return useMutation({
    mutationFn: (stock: StockMovementFormData) => (
      createMovement({
        data: stock
      })
    ),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['stockMovement'] })
    },
    onError: (error) => {
      console.log(error)
      toast.error(error.message || 'Failed to adjust stock')
    }
  })
}

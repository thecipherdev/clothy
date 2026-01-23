import { useMutation, useQueryClient } from "@tanstack/react-query"
import { createProduct, updateProduct } from "../api/mutations"
import { ProductFormData } from '../types/schema';
import { toast } from 'sonner'

export const queryClient = useQueryClient()

export const useCreateProduct = () => {
  return useMutation({
    mutationFn: (product: ProductFormData) => createProduct({
      data: product
    }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['products'] })
      toast.success('Product created successfully')
    },
    onError: (error) => {
      console.log(error)
      toast.error(error.message || 'Failed to create a new product')
    }
  })
}

export const useUpdateProduct = (editingProduct: string) => {
  return useMutation({
    mutationFn: (product: ProductFormData) => updateProduct({
      data: {
        product: product,
        editingProduct: editingProduct as string
      }
    }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['products'] })
      toast.success('Product updated successfully')
    },
    onError: (error) => {
      console.log(error)
      toast.error(error.message || 'Failed to save product')
    }
  })
}

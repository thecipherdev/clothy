import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { createProduct, updateProduct } from '../api/mutations'
import type { ProductFormData } from '../types/schema'


export const useCreateProduct = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (product: ProductFormData) =>
      createProduct({
        data: product,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['products'] })
      toast.success('Product created successfully')
    },
    onError: (error) => {
      console.log(error)
      toast.error(error.message || 'Failed to create a new product')
    },
  })
}

export const useUpdateProduct = (editingProduct: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (product: ProductFormData) =>
      updateProduct({
        data: {
          product: product,
          editingProduct: editingProduct,
        },
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['products'] })
      toast.success('Product updated successfully')
    },
    onError: (error) => {
      console.log(error)
      toast.error(error.message || 'Failed to save product')
    },
  })
}

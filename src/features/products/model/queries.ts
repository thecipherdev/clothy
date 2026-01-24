import { useQuery } from '@tanstack/react-query'
import { getCategoriesData, getProductsData } from '../api/queries'

export const useProducts = () => {
  return useQuery({
    queryKey: ['products'],
    queryFn: () =>
      getProductsData({
        data: {
          limit: 50,
        },
      }),
  })
}

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => getCategoriesData()
  })
}

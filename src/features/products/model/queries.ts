import { useQuery } from '@tanstack/react-query'
import { getCategoriesData, getProductsData, getProductData, getVariantsData } from '../api/queries'


export const useGetProduct = (id: string) => {
  return useQuery({
    queryKey: ['products', id],
    queryFn: () => (
      getProductData({ data: { id } })
    ),
    enabled: !!id

  })
}

export const useVariants = (id: string) => {
  return useQuery({
    queryKey: ['variants'],
    queryFn: () => getVariantsData({
      data: {
        id: id
      }
    }),
    enabled: !!id
  })
}

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

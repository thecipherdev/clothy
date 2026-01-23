import { useQuery } from "@tanstack/react-query"
import { getProductsData } from "../api/queries"

export const useProducts = () => {
  return useQuery({
    queryKey: ['products'],
    queryFn: () => getProductsData({
      data: {
        limit: 50,
      }
    })
  })
}

import { useQuery } from "@tanstack/react-query";
import { getBranchesData, getInventoryData } from "../api/queries";

export const useGetBranches = () => {
  return useQuery({
    queryKey: ['branches'],
    queryFn: () => getBranchesData()
  })
}


export const useGetInventories = () => {
  return useQuery({
    queryKey: ['inventory'],
    queryFn: () => getInventoryData()
  })
}


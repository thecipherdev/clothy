import { Select, SelectItem, SelectTrigger, SelectContent, SelectValue } from '@/components/ui/select';
import { Branch } from '../types'
import { useInvetoryContext } from '../context/InventoryContext';
interface Props {
  branches: Array<Branch> | null | undefined
  branchId: string
}

export function TableSelect({ branches, branchId }: Props) {
  const { updateFilter } = useInvetoryContext()
  return (
    <Select value={branchId} onValueChange={(value) => updateFilter('branchId', value)}>
      <SelectTrigger className="w-[150px]">
        <SelectValue placeholder="All branches" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Branches</SelectItem>
        {branches?.map((branch) => (
          <SelectItem key={branch.id} value={branch.id}>
            {branch.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
} 

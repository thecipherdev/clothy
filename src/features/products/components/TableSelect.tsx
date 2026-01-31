import { useProductContext } from '../context/ProductContext'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export function TableSelect({
  category_id,
  items,
}: {
  category_id: string
  items: Array<{ name: string; id: string }> | null | undefined
}) {
  const { updateFilter } = useProductContext()
  return (
    <Select
      value={category_id}
      onValueChange={(value) => updateFilter('category_id', value)}
    >
      <SelectTrigger className="w-[150px]">
        <SelectValue placeholder="All categories" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem key="all" value="all">
          All Categories
        </SelectItem>
        {items?.map((cat) => (
          <SelectItem key={cat.id} value={cat.id}>
            {cat.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

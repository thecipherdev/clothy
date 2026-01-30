import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import { useProductContext } from '../context/ProductContext'

export function TableSelect({
  category_id,
  items
}: {
  category_id: string
  items: { name: string, id: string }[] | null | undefined
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

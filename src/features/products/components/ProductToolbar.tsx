import { PropsWithChildren } from "react"
import { Search, ShoppingBag } from "lucide-react"
import { TableSelect } from "./TableSelect"
import { Input } from "@/components/ui/input"
import { CardHeader, CardTitle } from "@/components/ui/card"
import { UseAppForm } from "@/types/form"
import { ProductDialog } from "./ProductDialog"
import { useProductContext } from "../context/ProductContext"

type Item = {
  id: string;
  name: string;
}

type ProductToolbarProps = {
  searchParams: any;
  categories: Item[] | null | undefined;
  handleOpenDialog: () => void;
  sizes: string[];
  colors: string[];
  form: UseAppForm
} & PropsWithChildren

export function ProductToolbar({
  searchParams,
  categories,
  handleOpenDialog,
  sizes,
  colors,
  form
}: ProductToolbarProps) {
  const { updateFilter } = useProductContext()

  return (
    <CardHeader>
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <CardTitle className="text-base flex items-center gap-2">
          <ShoppingBag className="h-4 w-4" />
          All Products
        </CardTitle>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={searchParams.prod_sku ?? ''}
              onChange={(e) => updateFilter('prod_sku', e.target.value)}
              className="pl-9 w-[200px]"
            />
          </div>
          <TableSelect
            category_id={searchParams.category_id ?? 'all'}
            items={categories}
          />
          <ProductDialog
            handleOpenDialog={handleOpenDialog}
            sizes={sizes}
            colors={colors}
            form={form}
          />
        </div>
      </div>
    </CardHeader>
  )
}

import { AlertTriangle, Boxes, PackagePlus, Search } from 'lucide-react'

import { useInvetoryContext } from '../context/InventoryContext'
import { TableSelect } from './TableSelect'
import type { Branch } from '../types'
import type { SearchParamsType } from '../types/schema'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CardHeader, CardTitle } from '@/components/ui/card'

interface ToolbarProps {
  branches: Array<Branch> | null | undefined
  searchParams: SearchParamsType
}

export function InventoryToolbar({ branches, searchParams }: ToolbarProps) {
  const { updateFilter } = useInvetoryContext()
  return (
    <CardHeader>
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <CardTitle className="text-base flex items-center gap-2">
          <Boxes className="h-4 w-4" />
          Stock Levels
        </CardTitle>
        <div className="flex flex-wrap gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={searchParams.product ?? ''}
              onChange={(e) => updateFilter('product', e.target.value)}
              className="pl-9 w-[180px]"
            />
          </div>
          <TableSelect
            branches={branches}
            branchId={searchParams.branchId ?? 'all'}
          />
          <ButtonGroup />
        </div>
      </div>
    </CardHeader>
  )
}

function ButtonGroup() {
  const { searchParams, updateFilter, navigate } = useInvetoryContext()
  return (
    <>
      <Button
        variant={searchParams.showLowStock ? 'default' : 'outline'}
        size="sm"
        onClick={() => updateFilter('showLowStock', !searchParams.showLowStock)}
      >
        <AlertTriangle className="h-4 w-4 mr-1" />
        Low Stock
      </Button>
      <Button
        size="sm"
        onClick={() =>
          navigate({
            to: '/purchase-orders/$orderId',
            params: { orderId: 'new' },
          })
        }
      >
        <PackagePlus className="h-4 w-4 mr-1" />
        Add Stock
      </Button>
    </>
  )
}

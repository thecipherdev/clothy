import { AlertTriangle, Boxes, PackagePlus, Search } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectItem, SelectTrigger, SelectContent, SelectValue } from '@/components/ui/select';
import { Branch } from '../types'

interface ToolbarProps {
  branches: Array<Branch>;
}

export function InventoryToolbar({ branches }: ToolbarProps) {
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
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-[180px]"
            />
          </div>
          <Select value={selectedBranch} onValueChange={setSelectedBranch}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="All branches" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Branches</SelectItem>
              {branches.map((branch) => (
                <SelectItem key={branch.id} value={branch.id}>
                  {branch.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant={showLowStock ? 'default' : 'outline'}
            size="sm"
            onClick={() => setShowLowStock(!showLowStock)}
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
        </div>
      </div>
    </CardHeader>
  )

}

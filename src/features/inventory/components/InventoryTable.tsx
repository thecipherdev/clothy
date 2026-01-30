import { Boxes, Minus, Plus } from "lucide-react";
import { InventoryItem } from "../types";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Props {
  isLoadingInventory: boolean;
  inventory: InventoryItem[] | undefined
  handleAdjustStock: (item: InventoryItem, type: 'in' | 'out') => void
}

export function InventoryTable({ isLoadingInventory, inventory, handleAdjustStock }: Props) {

  if (isLoadingInventory) {
    return (
      <div className="flex items-center justify-center h-32" >
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
      </div>

    )
  }

  if (inventory?.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Boxes className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No inventory records found.</p>
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Product</TableHead>
          <TableHead>Variant</TableHead>
          <TableHead>Branch</TableHead>
          <TableHead>Quantity</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="w-[120px]">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {inventory?.map((item) => (
          <TableRow key={item.id}>
            <TableCell>
              <div>
                <p className="font-medium">
                  {item.variant?.product?.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {item.variant?.product?.sku}
                </p>
              </div>
            </TableCell>
            <TableCell>
              <div className="flex gap-1">
                <Badge variant="outline">{item.variant?.size}</Badge>
                <Badge variant="outline">{item.variant?.color}</Badge>
              </div>
            </TableCell>
            <TableCell>{item.branch?.name}</TableCell>
            <TableCell className="font-medium">
              {item.quantity}
            </TableCell>
            <TableCell>
              {item.quantity < item.low_stock_threshold ? (
                <Badge variant="destructive">Low Stock</Badge>
              ) : item.quantity === 0 ? (
                <Badge variant="secondary">Out of Stock</Badge>
              ) : (
                <Badge variant="default">In Stock</Badge>
              )}
            </TableCell>
            <TableCell>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleAdjustStock(item, 'in')}
                  title="Add Stock"
                >
                  <Plus className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleAdjustStock(item, 'out')}
                  title="Remove Stock"
                  disabled={item.quantity === 0}
                >
                  <Minus className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

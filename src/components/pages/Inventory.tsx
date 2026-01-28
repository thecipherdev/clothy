import { getRouteApi } from '@tanstack/react-router'
import { useState } from 'react'
import * as z from 'zod';
import { toast } from 'sonner'
import {
  Boxes,
  Minus,
  Plus,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useAppForm } from '@/components/form/hooks'
import { UseAppForm } from '@/types/form';

import { useGetBranches, useGetInventories } from '@/features/inventory/model/queries'
import { InventoryToolbar } from '@/features/inventory/components/InventoryToolbar'
import { useStockAdjustment } from '@/features/inventory/model/mutations'
import { stockMovementFormSchema } from '@/features/inventory/types/schema'

import { InventoryItem } from '@/features/inventory/types';
import { useInvetoryContext } from '@/features/inventory/context/InventoryContext';
import { UpdateStockForm } from '@/features/inventory/components/UpdateStockForm';
import { useGlobalContext } from '@/context/GlobalContext';

type FormData = z.infer<typeof stockMovementFormSchema>

const Route = getRouteApi('/(app)/inventory')

export function Inventory() {
  const [adjustmentType, setAdjustmentType] = useState<'in' | 'out'>('in')
  const { selectedInventory, setSelectedInventory } = useInvetoryContext()
  const { isDialogOpen, setIsDialogOpen } = useGlobalContext()

  const searchParams = Route.useSearch()
  const { data: branches } = useGetBranches()
  const { data: inventory, isLoading: isLoadingInventory } = useGetInventories()
  const updateStockAdjustment = useStockAdjustment(adjustmentType)

  const form = useAppForm({
    defaultValues: {
      quantity: "",
      reason: "",
    } satisfies FormData as FormData,
    validators: {
      onSubmit: stockMovementFormSchema
    },
    onSubmit: async ({ value }) => {
      if (!selectedInventory || !value.quantity) return

      const quantity = parseInt(value.quantity)
      if (quantity <= 0) {
        toast.error('Quantity must be greater than 0')
        return
      }

      if (adjustmentType === 'out' && quantity > selectedInventory.quantity) {
        toast.error('Cannot remove more than available stock')
        return
      }

      try {
        const newQuantity =
          adjustmentType === 'in'
            ? selectedInventory.quantity + quantity
            : selectedInventory.quantity - quantity

        updateStockAdjustment.mutate({
          new_quantity: newQuantity,
          quantity: quantity,
          momvement_type: adjustmentType,
          inventory_id: selectedInventory.id,
          reason: value.reason || null,
          performed_by: '2214933b-7c33-480e-9177-5b53a1e8d2d0'
        })
        setIsDialogOpen(false)
      } catch (error: any) {
        console.error('Error adjusting stock:', error)
        toast.error(error.message || 'Failed to adjust stock')
      }

    }

  })

  const handleAdjustStock = (item: InventoryItem, type: 'in' | 'out') => {
    setSelectedInventory(item)
    setAdjustmentType(type)
    setIsDialogOpen(true)
  }

  const filteredInventory = inventory?.data.filter((item) => {
    const searchTerm = searchParams.product?.toLowerCase();
    const matchesSearch = !searchTerm ||
      item.variant?.product?.name
        .toLowerCase()
        .includes(searchTerm) ||
      item.variant?.product?.sku
        .toLowerCase()
        .includes(searchTerm)
    const matchesBranch =
      !searchParams.branchId ||
      searchParams.branchId === 'all' || item.branch?.id === searchParams.branchId
    const matchesLowStock =
      !searchParams.showLowStock || item.quantity < item.low_stock_threshold
    return matchesSearch && matchesBranch && matchesLowStock
  })

  return (
    <>
      <Card>
        <InventoryToolbar branches={branches?.data} searchParams={searchParams} />
        <CardContent>
          {isLoadingInventory ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          ) : filteredInventory?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Boxes className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No inventory records found.</p>
            </div>
          ) : (
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
                {filteredInventory?.map((item) => (
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
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {adjustmentType === 'in' ? 'Add Stock' : 'Remove Stock'}
            </DialogTitle>
          </DialogHeader>
          {selectedInventory && (
            <UpdateStockForm
              form={form as unknown as UseAppForm}
              adjustmentType={adjustmentType}

            />
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

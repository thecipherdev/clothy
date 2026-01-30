import { createFileRoute, useNavigate  } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import {
  ArrowLeft,
  Check,
  ChevronsUpDown,
  Loader2,
  Package,
  Plus,
  Send,
  Trash2,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/hooks/useAuth'

interface Supplier {
  id: string
  name: string
}

interface Branch {
  id: string
  name: string
}

interface VariantOption {
  id: string
  size: string
  color: string
  product: { name: string; sku: string }
}

interface OrderItem {
  id: string
  variant_id: string
  quantity_ordered: number
  quantity_received: number
  unit_price: number
  variant: VariantOption
}

interface PurchaseOrder {
  id: string
  order_number: string
  status: string
  order_date: string | null
  expected_delivery: string | null
  total_amount: number
  notes: string | null
  supplier_id: string
  branch_id: string
  supplier: Supplier
  branch: Branch
}

export const Route = createFileRoute('/(app)/purchase-orders/$orderId')({
  component: RouteComponent,
})

function RouteComponent() {
  const { orderId } = Route.useParams()
  const navigate = useNavigate()
  const { user, role } = useAuth()
  const isNew = orderId === 'new'

  const [loading, setLoading] = useState(!isNew)
  const [submitting, setSubmitting] = useState(false)
  const [order, setOrder] = useState<PurchaseOrder | null>(null)
  const [items, setItems] = useState<Array<OrderItem>>([])
  const [suppliers, setSuppliers] = useState<Array<Supplier>>([])
  const [branches, setBranches] = useState<Array<Branch>>([])
  const [variants, setVariants] = useState<Array<VariantOption>>([])

  // Form state for new order
  const [supplierId, setSupplierId] = useState('')
  const [branchId, setBranchId] = useState('')
  const [expectedDelivery, setExpectedDelivery] = useState('')
  const [notes, setNotes] = useState('')

  // Add item dialog
  const [showAddItemForm, setShowAddItemForm] = useState(false)
  const [variantSearchOpen, setVariantSearchOpen] = useState(false)
  const [selectedVariantId, setSelectedVariantId] = useState('')
  const [itemQuantity, setItemQuantity] = useState(1)
  const [itemPrice, setItemPrice] = useState(0)

  // Receive dialog
  const [receiveDialogOpen, setReceiveDialogOpen] = useState(false)
  const [receiveQuantities, setReceiveQuantities] = useState<
    Record<string, number>
  >({})

  useEffect(() => {
    fetchSuppliers()
    fetchBranches()
    fetchVariants()
    if (!isNew && orderId) {
      fetchOrder(orderId)
    }
  }, [orderId, isNew])

  const fetchSuppliers = async () => {
    const { data } = await supabase
      .from('suppliers')
      .select('id, name')
      .eq('is_active', true)
      .order('name')
    if (data) setSuppliers(data)
  }

  const fetchBranches = async () => {
    const { data } = await supabase
      .from('branches')
      .select('id, name')
      .eq('is_active', true)
      .order('name')
    if (data) setBranches(data)
  }

  const fetchVariants = async () => {
    const { data } = await supabase
      .from('product_variants')
      .select('id, size, color, product:products(name, sku)')
      .order('created_at')
    if (data) setVariants(data as unknown as Array<VariantOption>)
  }

  const fetchOrder = async (orderId: string) => {
    const { data: orderData, error: orderError } = await supabase
      .from('purchase_orders')
      .select(
        `
        *,
        supplier:suppliers(id, name),
        branch:branches(id, name)
      `,
      )
      .eq('id', orderId)
      .single()

    if (orderError) {
      toast.error('Failed to load order')
      navigate({ to: '/purchase-orders' })
      return
    }

    setOrder(orderData as unknown as PurchaseOrder)
    setNotes(orderData.notes || '')

    const { data: itemsData } = await supabase
      .from('purchase_order_items')
      .select(
        `
        id,
        variant_id,
        quantity_ordered,
        quantity_received,
        unit_price,
        variant:product_variants(id, size, color, product:products(name, sku))
      `,
      )
      .eq('purchase_order_id', orderId)

    if (itemsData) setItems(itemsData as unknown as Array<OrderItem>)
    setLoading(false)
  }

  const handleCreateOrder = async () => {
    if (!supplierId || !branchId) {
      toast.error('Please select supplier and branch')
      return
    }

    setSubmitting(true)

    const { data, error } = await supabase
      .from('purchase_orders')
      .insert({
        order_number: '', // Will be auto-generated by trigger
        supplier_id: supplierId,
        branch_id: branchId,
        expected_delivery: expectedDelivery || null,
        notes: notes || null,
        created_by: user?.id,
        status: 'draft',
      } as any)
      .select()
      .single()

    if (error) {
      toast.error('Failed to create order')
    } else {
      toast.success('Order created')
      navigate({ to: `/purchase-orders/${data.id}` })
    }

    setSubmitting(false)
  }

  const handleAddItem = async () => {
    if (!order || !selectedVariantId || itemQuantity < 1) {
      toast.error('Please fill all fields')
      return
    }

    const { error } = await supabase.from('purchase_order_items').insert({
      purchase_order_id: order.id,
      variant_id: selectedVariantId,
      quantity_ordered: itemQuantity,
      unit_price: itemPrice,
    })

    if (error) {
      toast.error('Failed to add item')
    } else {
      // Update total
      const newTotal = Number(order.total_amount) + itemQuantity * itemPrice
      await supabase
        .from('purchase_orders')
        .update({ total_amount: newTotal })
        .eq('id', order.id)

      toast.success('Item added')
      setShowAddItemForm(false)
      setSelectedVariantId('')
      setItemQuantity(1)
      setItemPrice(0)
      fetchOrder(order.id)
    }
  }

  const getSelectedVariant = () => {
    return variants.find((v) => v.id === selectedVariantId)
  }

  const handleRemoveItem = async (item: OrderItem) => {
    if (!order || order.status !== 'draft') return

    const { error } = await supabase
      .from('purchase_order_items')
      .delete()
      .eq('id', item.id)

    if (error) {
      toast.error('Failed to remove item')
    } else {
      const newTotal =
        Number(order.total_amount) - item.quantity_ordered * item.unit_price
      await supabase
        .from('purchase_orders')
        .update({ total_amount: Math.max(0, newTotal) })
        .eq('id', order.id)

      toast.success('Item removed')
      fetchOrder(order.id)
    }
  }

  const handleSubmitOrder = async () => {
    if (!order || items.length === 0) {
      toast.error('Add items before submitting')
      return
    }

    const { error } = await supabase
      .from('purchase_orders')
      .update({
        status: 'ordered',
        order_date: new Date().toISOString().split('T')[0],
      })
      .eq('id', order.id)

    if (error) {
      toast.error('Failed to submit order')
    } else {
      toast.success('Order submitted to supplier')
      fetchOrder(order.id)
    }
  }

  const openReceiveDialog = () => {
    const quantities: Record<string, number> = {}
    items.forEach((item) => {
      quantities[item.id] = item.quantity_ordered - item.quantity_received
    })
    setReceiveQuantities(quantities)
    setReceiveDialogOpen(true)
  }

  const handleReceiveItems = async () => {
    if (!order) return

    setSubmitting(true)

    // Update each item's received quantity
    for (const item of items) {
      const toReceive = receiveQuantities[item.id] || 0
      if (toReceive <= 0) continue

      const newReceived = item.quantity_received + toReceive

      await supabase
        .from('purchase_order_items')
        .update({ quantity_received: newReceived })
        .eq('id', item.id)

      // Update inventory
      const { data: inventory } = await supabase
        .from('inventory')
        .select('id, quantity')
        .eq('branch_id', order.branch_id)
        .eq('variant_id', item.variant_id)
        .maybeSingle()

      if (inventory) {
        await supabase
          .from('inventory')
          .update({ quantity: inventory.quantity + toReceive })
          .eq('id', inventory.id)

        // Record stock movement
        await supabase.from('stock_movements').insert({
          inventory_id: inventory.id,
          quantity: toReceive,
          movement_type: 'purchase',
          reason: `Received from PO ${order.order_number}`,
          performed_by: user?.id,
          reference_id: order.id,
        })
      } else {
        // Create inventory record
        const { data: newInventory } = await supabase
          .from('inventory')
          .insert({
            branch_id: order.branch_id,
            variant_id: item.variant_id,
            quantity: toReceive,
          })
          .select()
          .single()

        if (newInventory) {
          await supabase.from('stock_movements').insert({
            inventory_id: newInventory.id,
            quantity: toReceive,
            movement_type: 'purchase',
            reason: `Received from PO ${order.order_number}`,
            performed_by: user?.id,
            reference_id: order.id,
          })
        }
      }
    }

    // Check if all items are fully received
    const { data: updatedItems } = await supabase
      .from('purchase_order_items')
      .select('quantity_ordered, quantity_received')
      .eq('purchase_order_id', order.id)

    const allReceived = updatedItems?.every(
      (i) => i.quantity_received >= i.quantity_ordered,
    )
    const partialReceived = updatedItems?.some((i) => i.quantity_received > 0)

    await supabase
      .from('purchase_orders')
      .update({
        status: allReceived
          ? 'received'
          : partialReceived
            ? 'partial'
            : 'ordered',
        received_by: user?.id,
      })
      .eq('id', order.id)

    toast.success('Items received and inventory updated')
    setReceiveDialogOpen(false)
    fetchOrder(order.id)
    setSubmitting(false)
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<
      string,
      'default' | 'secondary' | 'destructive' | 'outline'
    > = {
      draft: 'secondary',
      ordered: 'default',
      partial: 'outline',
      received: 'outline',
      cancelled: 'destructive',
    }
    return <Badge variant={variants[status] || 'secondary'}>{status}</Badge>
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // New order form
  if (isNew) {
    return (
      <div className="flex flex-col gap-4">
        <div className="space-y-6">
          <Button
            variant="ghost"
            onClick={() => navigate({ to: '/purchase-orders' })}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Orders
          </Button>

          <Card>
            <CardHeader>
              <CardTitle>Create Purchase Order</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Supplier *</Label>
                  <Select value={supplierId} onValueChange={setSupplierId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select supplier" />
                    </SelectTrigger>
                    <SelectContent>
                      {suppliers.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Destination Branch *</Label>
                  <Select value={branchId} onValueChange={setBranchId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select branch" />
                    </SelectTrigger>
                    <SelectContent>
                      {branches.map((b) => (
                        <SelectItem key={b.id} value={b.id}>
                          {b.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Expected Delivery</Label>
                <Input
                  type="date"
                  value={expectedDelivery}
                  onChange={(e) => setExpectedDelivery(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Order notes..."
                />
              </div>

              <Button onClick={handleCreateOrder} disabled={submitting}>
                {submitting && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                Create Order
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Order detail view
  return (
    <div>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate({ to: '/purchase-orders' })}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Orders
          </Button>
          <div className="flex gap-2">
            {order?.status === 'draft' && (
              <Button onClick={handleSubmitOrder}>
                <Send className="h-4 w-4 mr-2" />
                Submit Order
              </Button>
            )}
            {(order?.status === 'ordered' || order?.status === 'partial') &&
              role === 'admin' && (
                <Button onClick={openReceiveDialog}>
                  <Package className="h-4 w-4 mr-2" />
                  Receive Items
                </Button>
              )}
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{order?.order_number}</CardTitle>
              {order && getStatusBadge(order.status)}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div>
                <Label className="text-muted-foreground">Supplier</Label>
                <p className="font-medium">{order?.supplier.name}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Branch</Label>
                <p className="font-medium">{order?.branch.name}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Order Date</Label>
                <p className="font-medium">
                  {order?.order_date
                    ? new Date(order.order_date).toLocaleDateString()
                    : '-'}
                </p>
              </div>
              <div>
                <Label className="text-muted-foreground">Total</Label>
                <p className="font-medium text-lg">
                  ${Number(order?.total_amount || 0).toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        {order?.status === 'draft' && (
          <Card className="mb-4 border-dashed">
            <CardContent className="pt-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Product Variant</Label>
                  <Popover
                    open={variantSearchOpen}
                    onOpenChange={setVariantSearchOpen}
                  >
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={variantSearchOpen}
                        className="w-full justify-between"
                      >
                        {selectedVariantId ? (
                          <>
                            {getSelectedVariant()?.product.name} -{' '}
                            {getSelectedVariant()?.size}/
                            {getSelectedVariant()?.color}
                          </>
                        ) : (
                          'Search products...'
                        )}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0" align="start">
                      <Command>
                        <CommandInput placeholder="Search product..." />
                        <CommandList>
                          <CommandEmpty>No product found.</CommandEmpty>
                          <CommandGroup>
                            {variants.map((v) => (
                              <CommandItem
                                key={v.id}
                                value={`${v.product.name} ${v.size} ${v.color}`}
                                onSelect={() => {
                                  setSelectedVariantId(v.id)
                                  setVariantSearchOpen(false)
                                }}
                              >
                                <Check
                                  className={cn(
                                    'mr-2 h-4 w-4',
                                    selectedVariantId === v.id
                                      ? 'opacity-100'
                                      : 'opacity-0',
                                  )}
                                />
                                <div>
                                  <div>{v.product.name}</div>
                                  <div className="text-sm text-muted-foreground">
                                    {v.size} / {v.color}
                                  </div>
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Quantity</Label>
                    <Input
                      type="number"
                      min={1}
                      value={itemQuantity}
                      onChange={(e) =>
                        setItemQuantity(parseInt(e.target.value) || 1)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Unit Price</Label>
                    <Input
                      type="number"
                      min={0}
                      step={0.01}
                      value={itemPrice}
                      onChange={(e) =>
                        setItemPrice(parseFloat(e.target.value) || 0)
                      }
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleAddItem} className="flex-1">
                    Add Item
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowAddItemForm(false)
                      setSelectedVariantId('')
                      setItemQuantity(1)
                      setItemPrice(0)
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        <Card>
          <CardContent>
            {items.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No items added yet.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Ordered</TableHead>
                    <TableHead>Received</TableHead>
                    <TableHead>Unit Price</TableHead>
                    <TableHead>Subtotal</TableHead>
                    {order?.status === 'draft' && <TableHead></TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {item.variant.product.name}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {item.variant.size} / {item.variant.color}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{item.quantity_ordered}</TableCell>
                      <TableCell>{item.quantity_received}</TableCell>
                      <TableCell>
                        ${Number(item.unit_price).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        ${(item.quantity_ordered * item.unit_price).toFixed(2)}
                      </TableCell>
                      {order?.status === 'draft' && (
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveItem(item)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Receive Items Dialog */}
        <Dialog open={receiveDialogOpen} onOpenChange={setReceiveDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Receive Items</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              {items.map((item) => {
                const remaining = item.quantity_ordered - item.quantity_received
                if (remaining <= 0) return null
                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-4"
                  >
                    <div className="flex-1">
                      <div className="font-medium">
                        {item.variant.product.name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {item.variant.size} / {item.variant.color} ({remaining}{' '}
                        pending)
                      </div>
                    </div>
                    <Input
                      type="number"
                      min={0}
                      max={remaining}
                      value={receiveQuantities[item.id] || 0}
                      onChange={(e) =>
                        setReceiveQuantities({
                          ...receiveQuantities,
                          [item.id]: Math.min(
                            parseInt(e.target.value) || 0,
                            remaining,
                          ),
                        })
                      }
                      className="w-24"
                    />
                  </div>
                )
              })}
              <Button
                onClick={handleReceiveItems}
                className="w-full"
                disabled={submitting}
              >
                {submitting && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                Confirm Receipt
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import * as z from 'zod'
import { toast } from 'sonner'
import { ArrowRight, Check, Loader2, Plus, Truck, X } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useAppForm } from '@/components/form/hooks'
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

interface Branch {
  id: string
  name: string
}

interface TransferItem {
  id: string
  quantity: number
  status: string
  notes: string | null
  created_at: string
  from_branch: { id: string; name: string }
  to_branch: { id: string; name: string }
  variant: {
    id: string
    size: string
    color: string
    product: { id: string; name: string; sku: string }
  }
  requested_by: string | null
}

interface InventoryOption {
  id: string
  quantity: number
  name: string
  sku: string
  size: string
  color: string
}

const formSchema = z.object({
  fromBranchId: z.string(),
  toBranchId: z.string(),
  variantId: z.string(),
  quantity: z.string().regex(/^[0-9]$/, 'Numeric value is required'),
  notes: z.string().optional(),
})

type FormData = z.infer<typeof formSchema>

export const Route = createFileRoute('/(app)/transfers')({
  component: RouteComponent,
})

function RouteComponent() {
  const form = useAppForm({
    defaultValues: {
      fromBranchId: '',
      toBranchId: '',
      variantId: '',
      quantity: '',
      notes: '',
    } satisfies FormData as FormData,
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      const {
        fromBranchId,
        toBranchId,
        variantId,
        quantity: qty,
        notes,
      } = value
      const quantity = parseInt(qty)

      if (!fromBranchId || !toBranchId || !variantId || quantity < 1) {
        toast.error('Please fill all required fields')
        return
      }

      if (fromBranchId === toBranchId) {
        toast.error('Source and destination branches must be different')
        return
      }

      const selectedInventory = inventoryOptions.find((i) => i.id === variantId)
      if (selectedInventory && quantity > selectedInventory.quantity) {
        toast.error(`Only ${selectedInventory.quantity} units available`)
        return
      }

      setSubmitting(true)

      const { error } = await supabase.from('transfers').insert({
        from_branch_id: fromBranchId,
        to_branch_id: toBranchId,
        variant_id: variantId,
        quantity,
        notes: notes || null,
        requested_by: user?.id,
        status: 'pending',
      })

      if (error) {
        console.error('Error creating transfer:', error)
        toast.error('Failed to create transfer')
      } else {
        toast.success('Transfer request created')
        setDialogOpen(false)
        form.reset()
        fetchTransfers()
      }

      setSubmitting(false)
    },
  })
  const { user, role } = useAuth()
  const [transfers, setTransfers] = useState<Array<TransferItem>>([])
  const [branches, setBranches] = useState<Array<Branch>>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)

  // temporary (will make this querry search params later)
  const [variantId, setVariantId] = useState('')
  const [fromBranchId, setFromBranchId] = useState('')

  const [inventoryOptions, setInventoryOptions] = useState<Array<InventoryOption>>(
    [],
  )
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchTransfers()
    fetchBranches()
  }, [])

  useEffect(() => {
    if (fromBranchId) {
      fetchInventoryForBranch(fromBranchId)
    } else {
      setInventoryOptions([])
      setVariantId('')
    }
  }, [fromBranchId])

  const fetchTransfers = async () => {
    const { data, error } = await supabase
      .from('transfers')
      .select(
        `
        id,
        quantity,
        status,
        notes,
        created_at,
        requested_by,
        from_branch:branches!transfers_from_branch_id_fkey(id, name),
        to_branch:branches!transfers_to_branch_id_fkey(id, name),
        variant:product_variants(
          id,
          size,
          color,
          product:products(id, name, sku)
        )
      `,
      )
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching transfers:', error)
      toast.error('Failed to load transfers')
    } else {
      setTransfers(data as unknown as Array<TransferItem>)
    }
    setLoading(false)
  }

  const fetchBranches = async () => {
    const { data } = await supabase
      .from('branches')
      .select('id, name')
      .eq('is_active', true)
      .order('name')

    if (data) setBranches(data)
  }

  const fetchInventoryForBranch = async (branchId: string) => {
    const { data, error } = await supabase
      .from('inventory')
      .select(
        `
        variant_id,
        quantity,
        variant:product_variants(
          size,
          color,
          product:products(name, sku)
        )
      `,
      )
      .eq('branch_id', branchId)
      .gt('quantity', 0)

    if (error) {
      console.error('Error fetching inventory:', error)
      return
    }

    const options: Array<InventoryOption> = (data || []).map((item: any) => ({
      id: item.variant_id,
      quantity: item.quantity,
      name: item.variant?.product?.name || 'Unknown',
      sku: item.variant?.product?.sku || '',
      size: item.variant?.size || '',
      color: item.variant?.color || '',
    }))

    setInventoryOptions(options)
  }

  const handleUpdateStatus = async (
    transferId: string,
    newStatus: string,
    transfer: TransferItem,
  ) => {
    // Start transaction-like operations
    if (newStatus === 'completed') {
      // Deduct from source branch
      const { data: sourceInventory } = await supabase
        .from('inventory')
        .select('id, quantity')
        .eq('branch_id', transfer.from_branch.id)
        .eq('variant_id', transfer.variant.id)
        .single()

      if (!sourceInventory || sourceInventory.quantity < transfer.quantity) {
        toast.error('Insufficient stock in source branch')
        return
      }

      // Get or create destination inventory
      const { data: destInventory } = await supabase
        .from('inventory')
        .select('id, quantity')
        .eq('branch_id', transfer.to_branch.id)
        .eq('variant_id', transfer.variant.id)
        .maybeSingle()

      // Update source inventory
      const { error: sourceError } = await supabase
        .from('inventory')
        .update({ quantity: sourceInventory.quantity - transfer.quantity })
        .eq('id', sourceInventory.id)

      if (sourceError) {
        toast.error('Failed to update source inventory')
        return
      }

      // Update or create destination inventory
      if (destInventory) {
        const { error: destError } = await supabase
          .from('inventory')
          .update({ quantity: destInventory.quantity + transfer.quantity })
          .eq('id', destInventory.id)

        if (destError) {
          toast.error('Failed to update destination inventory')
          return
        }
      } else {
        const { error: insertError } = await supabase.from('inventory').insert({
          branch_id: transfer.to_branch.id,
          variant_id: transfer.variant.id,
          quantity: transfer.quantity,
        })

        if (insertError) {
          toast.error('Failed to create destination inventory')
          return
        }
      }

      // Record stock movements
      await supabase.from('stock_movements').insert([
        {
          inventory_id: sourceInventory.id,
          quantity: -transfer.quantity,
          movement_type: 'transfer_out',
          reason: `Transfer to ${transfer.to_branch.name}`,
          performed_by: user?.id,
          reference_id: transferId,
        },
      ])

      // Get destination inventory id for movement record
      const { data: newDestInventory } = await supabase
        .from('inventory')
        .select('id')
        .eq('branch_id', transfer.to_branch.id)
        .eq('variant_id', transfer.variant.id)
        .single()

      if (newDestInventory) {
        await supabase.from('stock_movements').insert({
          inventory_id: newDestInventory.id,
          quantity: transfer.quantity,
          movement_type: 'transfer_in',
          reason: `Transfer from ${transfer.from_branch.name}`,
          performed_by: user?.id,
          reference_id: transferId,
        })
      }
    }

    // Update transfer status
    const updateData: any = { status: newStatus }
    if (newStatus === 'in_transit') {
      updateData.approved_by = user?.id
    } else if (newStatus === 'completed') {
      updateData.completed_by = user?.id
    }

    const { error } = await supabase
      .from('transfers')
      .update(updateData)
      .eq('id', transferId)

    if (error) {
      toast.error('Failed to update transfer status')
    } else {
      toast.success(
        `Transfer ${newStatus === 'cancelled' ? 'cancelled' : newStatus === 'in_transit' ? 'approved' : 'completed'}`,
      )
      fetchTransfers()
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<
      string,
      'default' | 'secondary' | 'destructive' | 'outline'
    > = {
      pending: 'secondary',
      in_transit: 'default',
      completed: 'outline',
      cancelled: 'destructive',
    }
    return (
      <Badge variant={variants[status] || 'secondary'}>
        {status.replace('_', ' ')}
      </Badge>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Stock Transfers</CardTitle>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Transfer
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Create Stock Transfer</DialogTitle>
              </DialogHeader>
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  form.handleSubmit()
                }}
                className="space-y-4 pt-4"
              >
                <div className="grid grid-cols-2 gap-4">
                  <form.AppField
                    name="fromBranchId"
                    children={(field) => {
                      setFromBranchId(field.state.value)
                      return (
                        <field.Select
                          formBaseProps={{ label: 'From Branch' }}
                          items={branches}
                          placeholder="Select Source"
                        />
                      )
                    }}
                  />
                  <form.AppField
                    name="toBranchId"
                    children={(field) => (
                      <field.Select
                        formBaseProps={{ label: 'To Branch' }}
                        items={branches}
                        placeholder="Select Destination"
                      />
                    )}
                  />
                </div>

                <form.AppField
                  name="variantId"
                  children={(field) => (
                    <field.Select
                      formBaseProps={{ label: 'Product Variant' }}
                      items={inventoryOptions}
                      placeholder={
                        fromBranchId
                          ? 'Select product'
                          : 'Select source branch first'
                      }
                    />
                  )}
                />

                <form.AppField
                  name="quantity"
                  children={(field) => (
                    <field.Input
                      inputMode="numeric"
                      formBaseProps={{ label: 'Quantity' }}
                      min={1}
                      max={
                        inventoryOptions.find((i) => i.id === variantId)
                          ?.quantity || 999
                      }
                      placeholder={
                        fromBranchId
                          ? 'Select product'
                          : 'Select source branch first'
                      }
                    />
                  )}
                />
                <form.AppField
                  name="notes"
                  children={(field) => (
                    <field.Textarea
                      formBaseProps={{ label: 'Notes (Optional)' }}
                      placeholder="Add any notes about this transfer..."
                    />
                  )}
                />
                <Button className="w-full" disabled={submitting}>
                  {submitting && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  Create Transfer Request
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {transfers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No transfers found. Create your first stock transfer.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Route</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transfers.map((transfer) => (
                  <TableRow key={transfer.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {transfer.variant.product.name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {transfer.variant.size} / {transfer.variant.color}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span>{transfer.from_branch.name}</span>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        <span>{transfer.to_branch.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{transfer.quantity}</TableCell>
                    <TableCell>{getStatusBadge(transfer.status)}</TableCell>
                    <TableCell>
                      {new Date(transfer.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      {role === 'admin' && transfer.status === 'pending' && (
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              handleUpdateStatus(
                                transfer.id,
                                'in_transit',
                                transfer,
                              )
                            }
                          >
                            <Truck className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() =>
                              handleUpdateStatus(
                                transfer.id,
                                'cancelled',
                                transfer,
                              )
                            }
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                      {role === 'admin' && transfer.status === 'in_transit' && (
                        <Button
                          size="sm"
                          onClick={() =>
                            handleUpdateStatus(
                              transfer.id,
                              'completed',
                              transfer,
                            )
                          }
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Complete
                        </Button>
                      )}
                      {transfer.status === 'pending' &&
                        transfer.requested_by === user?.id &&
                        role !== 'admin' && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() =>
                              handleUpdateStatus(
                                transfer.id,
                                'cancelled',
                                transfer,
                              )
                            }
                          >
                            Cancel
                          </Button>
                        )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

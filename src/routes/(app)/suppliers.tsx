import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import * as z from 'zod'
import { toast } from 'sonner'
import {
  Building2,
  Loader2,
  Mail,
  Pencil,
  Phone,
  Plus,
  User,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { useAppForm } from '@/components/form/hooks'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
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
  email: string | null
  phone: string | null
  address: string | null
  contact_person: string | null
  notes: string | null
  is_active: boolean
  created_at: string
}

export const Route = createFileRoute('/(app)/suppliers')({
  component: RouteComponent,
})

const formSchema = z.object({
  name: z.string(),
  email: z.email().optional(),
  phone: z.string().optional(),
  contactPerson: z.string(),
  address: z.string().optional(),
  notes: z.string().optional(),
  isActive: z.boolean(),
})

type FormData = z.infer<typeof formSchema>

function RouteComponent() {
  const { role } = useAuth()
  const [suppliers, setSuppliers] = useState<Array<Supplier>>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const form = useAppForm({
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      contactPerson: '',
      address: '',
      notes: '',
      isActive: true,
    } satisfies FormData as FormData,
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      const { name, email, phone, address, contactPerson, notes, isActive } =
        value

      if (!name.trim()) {
        toast.error('Supplier name is required')
        return
      }

      setSubmitting(true)

      const supplierData = {
        name: name.trim(),
        email: email?.trim() || '',
        phone: phone?.trim() || '',
        address: address?.trim() || '',
        contact_person: contactPerson.trim() || '',
        notes: notes?.trim() || '',
        is_active: isActive,
      }

      let error

      if (editingSupplier) {
        ;({ error } = await supabase
          .from('suppliers')
          .update(supplierData)
          .eq('id', editingSupplier.id))
      } else {
        ;({ error } = await supabase.from('suppliers').insert(supplierData))
      }

      if (error) {
        console.error('Error saving supplier:', error)
        toast.error('Failed to save supplier')
      } else {
        toast.success(editingSupplier ? 'Supplier updated' : 'Supplier created')
        setDialogOpen(false)
        form.reset()
        fetchSuppliers()
      }

      setSubmitting(false)
    },
  })

  useEffect(() => {
    fetchSuppliers()
  }, [])

  const fetchSuppliers = async () => {
    const { data, error } = await supabase
      .from('suppliers')
      .select('*')
      .order('name')

    if (error) {
      console.error('Error fetching suppliers:', error)
      toast.error('Failed to load suppliers')
    } else {
      setSuppliers(data || [])
    }
    setLoading(false)
  }

  const openEditDialog = (supplier: Supplier) => {
    const { name, email, phone, address, contact_person, notes, is_active } =
      supplier
    setEditingSupplier(supplier)
    form.setFieldValue('name', name)
    form.setFieldValue('email', email || '')
    form.setFieldValue('phone', phone || '')
    form.setFieldValue('address', address || '')
    form.setFieldValue('contactPerson', contact_person || '')
    form.setFieldValue('notes', notes || '')
    form.setFieldValue('isActive', is_active)
    setDialogOpen(true)
  }

  const handleDialogChange = (open: boolean) => {
    setDialogOpen(open)
    if (!open) form.reset()
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
          <CardTitle>Suppliers</CardTitle>
          {role === 'admin' && (
            <Dialog open={dialogOpen} onOpenChange={handleDialogChange}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Supplier
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>
                    {editingSupplier ? 'Edit Supplier' : 'Add Supplier'}
                  </DialogTitle>
                </DialogHeader>
                <form
                  onSubmit={() => {
                    form.handleSubmit()
                  }}
                  className="space-y-4 pt-4"
                >
                  <form.AppField
                    name="name"
                    children={(field) => (
                      <field.Input
                        formBaseProps={{ label: 'Company Name *' }}
                        placeholder="Enter supplier name"
                      />
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <form.AppField
                      name="email"
                      children={(field) => (
                        <field.Input
                          formBaseProps={{ label: 'Email' }}
                          placeholder="email@example.com"
                        />
                      )}
                    />
                    <form.AppField
                      name="phone"
                      children={(field) => (
                        <field.Input
                          formBaseProps={{ label: 'Phone' }}
                          placeholder="+63 959 3493 921"
                        />
                      )}
                    />
                  </div>

                  <form.AppField
                    name="contactPerson"
                    children={(field) => (
                      <field.Input
                        formBaseProps={{ label: 'Contact Person *' }}
                        placeholder="Primary contact name"
                      />
                    )}
                  />

                  <form.AppField
                    name="address"
                    children={(field) => (
                      <field.Textarea
                        formBaseProps={{ label: 'Address' }}
                        placeholder="Full address"
                      />
                    )}
                  />

                  <form.AppField
                    name="address"
                    children={(field) => (
                      <field.Textarea
                        formBaseProps={{ label: 'Notes' }}
                        placeholder="Additional notes..."
                      />
                    )}
                  />

                  <form.AppField
                    name="isActive"
                    children={(field) => (
                      <field.Switch label="Active" horizontal />
                    )}
                  />

                  <Button className="w-full" disabled={submitting}>
                    {submitting && (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    )}
                    {editingSupplier ? 'Update Supplier' : 'Create Supplier'}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </CardHeader>
        <CardContent>
          {suppliers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No suppliers found. Add your first supplier to get started.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Status</TableHead>
                  {role === 'admin' && (
                    <TableHead className="text-right">Actions</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {suppliers.map((supplier) => (
                  <TableRow key={supplier.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Building2 className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium">{supplier.name}</div>
                          {supplier.email && (
                            <div className="text-sm text-muted-foreground flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {supplier.email}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {supplier.contact_person && (
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3 text-muted-foreground" />
                          {supplier.contact_person}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {supplier.phone && (
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3 text-muted-foreground" />
                          {supplier.phone}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={supplier.is_active ? 'default' : 'secondary'}
                      >
                        {supplier.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    {role === 'admin' && (
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(supplier)}
                        >
                          <Pencil className="h-4 w-4" />
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
    </div>
  )
}

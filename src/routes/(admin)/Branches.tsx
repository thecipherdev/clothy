import { Navigate, createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import * as z from 'zod'
import { toast } from 'sonner'
import { Pencil, Plus, Store } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useAppForm } from '@/components/form/hooks'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/hooks/useAuth'

interface Branch {
  id: string
  name: string
  address: string | null
  phone: string | null
  is_active: boolean
  created_at: string
}

const formSchema = z.object({
  name: z.string().min(1, 'Enter branch name'),
  address: z.string().min(1, "Address can't be empty"),
  phone: z.string().optional(),
  is_active: z.boolean(),
})

type FormData = z.infer<typeof formSchema>

export const Route = createFileRoute('/(admin)/branches')({
  component: RouteComponent,
})

function RouteComponent() {
  const form = useAppForm({
    defaultValues: {
      name: '',
      address: '',
      phone: '',
      is_active: true,
    } satisfies FormData as FormData,
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        console.log('hey')
        if (editingBranch) {
          const { error } = await supabase
            .from('branches')
            .update({
              name: value.name,
              address: value.address || null,
              phone: value.phone || null,
              is_active: value.is_active,
            })
            .eq('id', editingBranch.id)

          if (error) throw error
          toast.success('Branch updated successfully')
        } else {
          const { error } = await supabase.from('branches').insert({
            name: value.name,
            address: value.address || null,
            phone: value.phone || null,
            is_active: value.is_active,
          })

          if (error) throw error
          toast.success('Branch created successfully')
        }

        setIsDialogOpen(false)
        fetchBranches()
      } catch (error: any) {
        console.error('Error saving branch:', error)
        toast.error(error.message || 'Failed to save branch')
      }
    },
  })
  const { role } = useAuth()
  const [branches, setBranches] = useState<Array<Branch>>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null)

  // Only admins can access this page
  if (role !== 'admin') {
    return <Navigate to="/dashboard" replace />
  }

  useEffect(() => {
    fetchBranches()
  }, [])

  async function fetchBranches() {
    try {
      const { data, error } = await supabase
        .from('branches')
        .select('*')
        .order('name')

      if (error) throw error
      setBranches(data || [])
    } catch (error) {
      console.error('Error fetching branches:', error)
      toast.error('Failed to load branches')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenDialog = (branch?: Branch) => {
    if (branch) {
      setEditingBranch(branch)
      form.setFieldValue('name', branch.name)
      form.setFieldValue('address', branch.address || '')
      form.setFieldValue('phone', branch.phone || '')
      form.setFieldValue('is_active', branch.is_active)
    } else {
      setEditingBranch(null)
      form.reset()
    }
    setIsDialogOpen(true)
  }

  return (
    <div className="flex flex-col gap-4">
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button className="w-fit ml-auto" onClick={() => handleOpenDialog()}>
            <Plus className="h-4 w-4 mr-2" />
            Add Branch
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingBranch ? 'Edit Branch' : 'Add New Branch'}
            </DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              form.handleSubmit()
            }}
            className="space-y-4"
          >
            <form.AppField
              name="name"
              children={(field) => (
                <field.Input formBaseProps={{ label: 'Branch Name' }} />
              )}
            />
            <form.AppField
              name="address"
              children={(field) => (
                <field.Input formBaseProps={{ label: 'Address' }} />
              )}
            />
            <form.AppField
              name="phone"
              children={(field) => (
                <field.Input formBaseProps={{ label: 'Phone' }} />
              )}
            />
            <form.AppField
              name="is_active"
              children={(field) => (
                <field.Switch label="Active" horizontal={true} />
              )}
            />
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                {editingBranch ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Store className="h-4 w-4" />
            All Branches
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          ) : branches.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Store className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No branches yet. Create your first branch to get started.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {branches.map((branch) => (
                  <TableRow key={branch.id}>
                    <TableCell className="font-medium">{branch.name}</TableCell>
                    <TableCell>{branch.address || '-'}</TableCell>
                    <TableCell>{branch.phone || '-'}</TableCell>
                    <TableCell>
                      <Badge
                        variant={branch.is_active ? 'default' : 'secondary'}
                      >
                        {branch.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenDialog(branch)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
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

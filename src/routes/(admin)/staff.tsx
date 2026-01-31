import { Navigate, createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Settings, Store, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Label } from '@/components/ui/label'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { Checkbox } from '@/components/ui/checkbox'

interface Profile {
  id: string
  user_id: string
  full_name: string
  email: string
  user_roles: Array<{ role: string }>
  staff_branches: Array<{ branch_id: string }>
}

interface Branch {
  id: string
  name: string
}

export const Route = createFileRoute('/(admin)/staff')({
  component: RouteComponent,
})

function RouteComponent() {
  const { role } = useAuth()
  const [profiles, setProfiles] = useState<Array<Profile>>([])
  const [branches, setBranches] = useState<Array<Branch>>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null)
  const [selectedRole, setSelectedRole] = useState<string>('')
  const [selectedBranches, setSelectedBranches] = useState<Array<string>>([])

  if (role !== 'admin') {
    return <Navigate to="/dashboard" replace />
  }

  useEffect(() => {
    fetchProfiles()
    fetchBranches()
  }, [])

  async function fetchProfiles() {
    try {
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, user_id, full_name, email')
        .order('full_name')

      if (profilesError) throw profilesError

      const { data: rolesData } = await supabase
        .from('user_roles')
        .select('user_id, role')
      const { data: branchesData } = await supabase
        .from('staff_branches')
        .select('user_id, branch_id')

      const enrichedProfiles: Array<Profile> = (profilesData || []).map(
        (p) => ({
          ...p,
          user_roles: (rolesData || [])
            .filter((r) => r.user_id === p.user_id)
            .map((r) => ({ role: r.role })),
          staff_branches: (branchesData || [])
            .filter((b) => b.user_id === p.user_id)
            .map((b) => ({ branch_id: b.branch_id })),
        }),
      )

      setProfiles(enrichedProfiles)
    } catch (error) {
      console.error('Error fetching profiles:', error)
      toast.error('Failed to load staff')
    } finally {
      setLoading(false)
    }
  }

  async function fetchBranches() {
    const { data } = await supabase
      .from('branches')
      .select('id, name')
      .eq('is_active', true)
      .order('name')
    setBranches(data || [])
  }

  const handleEditStaff = (profile: Profile) => {
    setSelectedProfile(profile)
    setSelectedRole(profile.user_roles[0]?.role || 'staff')
    setSelectedBranches(profile.staff_branches.map((sb) => sb.branch_id))
    setIsDialogOpen(true)
  }

  const handleSave = async () => {
    if (!selectedProfile) return

    try {
      // Update role
      await supabase.from('user_roles').upsert(
        {
          user_id: selectedProfile.user_id,
          role: selectedRole as any,
        },
        { onConflict: 'user_id,role' },
      )

      // Update branch assignments - delete existing and insert new
      await supabase
        .from('staff_branches')
        .delete()
        .eq('user_id', selectedProfile.user_id)

      if (selectedBranches.length > 0 && selectedRole !== 'admin') {
        await supabase.from('staff_branches').insert(
          selectedBranches.map((branchId) => ({
            user_id: selectedProfile.user_id,
            branch_id: branchId,
          })),
        )
      }

      toast.success('Staff updated successfully')
      setIsDialogOpen(false)
      fetchProfiles()
    } catch (error: any) {
      console.error('Error updating staff:', error)
      toast.error(error.message || 'Failed to update staff')
    }
  }

  const toggleBranch = (branchId: string) => {
    setSelectedBranches((prev) =>
      prev.includes(branchId)
        ? prev.filter((id) => id !== branchId)
        : [...prev, branchId],
    )
  }

  const getBranchNames = (branchIds: Array<string>) => {
    return branchIds
      .map((id) => branches.find((b) => b.id === id)?.name)
      .filter(Boolean)
      .join(', ')
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-4 w-4" />
            All Staff
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          ) : profiles.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No staff members yet.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Assigned Branches</TableHead>
                  <TableHead className="w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {profiles.map((profile) => (
                  <TableRow key={profile.id}>
                    <TableCell className="font-medium">
                      {profile.full_name}
                    </TableCell>
                    <TableCell>{profile.email}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          profile.user_roles[0]?.role === 'admin'
                            ? 'default'
                            : 'secondary'
                        }
                      >
                        {profile.user_roles[0]?.role || 'staff'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {profile.user_roles[0]?.role === 'admin' ? (
                        <span className="text-muted-foreground">
                          All branches
                        </span>
                      ) : profile.staff_branches.length === 0 ? (
                        <span className="text-muted-foreground">
                          None assigned
                        </span>
                      ) : (
                        getBranchNames(
                          profile.staff_branches.map((sb) => sb.branch_id),
                        )
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditStaff(profile)}
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
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
            <DialogTitle>Edit Staff Member</DialogTitle>
          </DialogHeader>
          {selectedProfile && (
            <div className="space-y-4">
              <div className="p-3 bg-muted rounded-lg">
                <p className="font-medium">{selectedProfile.full_name}</p>
                <p className="text-sm text-muted-foreground">
                  {selectedProfile.email}
                </p>
              </div>

              <div className="space-y-2">
                <Label>Role</Label>
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="staff">Staff</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {selectedRole !== 'admin' && (
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Store className="h-4 w-4" />
                    Assigned Branches
                  </Label>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {branches.map((branch) => (
                      <div key={branch.id} className="flex items-center gap-2">
                        <Checkbox
                          id={branch.id}
                          checked={selectedBranches.includes(branch.id)}
                          onCheckedChange={() => toggleBranch(branch.id)}
                        />
                        <label
                          htmlFor={branch.id}
                          className="text-sm cursor-pointer"
                        >
                          {branch.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleSave}>Save Changes</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

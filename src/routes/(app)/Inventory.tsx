import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Boxes, Search, Plus, Minus, AlertTriangle } from 'lucide-react';
// import { useAuth } from '@/hooks/useAuth';

interface Branch {
  id: string;
  name: string;
}

interface InventoryItem {
  id: string;
  quantity: number;
  low_stock_threshold: number;
  branch: { id: string; name: string };
  variant: {
    id: string;
    size: string;
    color: string;
    product: { id: string; name: string; sku: string };
  };
}

export const Route = createFileRoute('/(app)/inventory')({
  component: RouteComponent,
})

function RouteComponent() {
  // const { user } = useAuth();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBranch, setSelectedBranch] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showLowStock, setShowLowStock] = useState(false);
  const [isAdjustDialogOpen, setIsAdjustDialogOpen] = useState(false);
  const [selectedInventory, setSelectedInventory] = useState<InventoryItem | null>(null);
  const [adjustmentType, setAdjustmentType] = useState<'in' | 'out'>('in');
  const [adjustmentQuantity, setAdjustmentQuantity] = useState('');
  const [adjustmentReason, setAdjustmentReason] = useState('');

  useEffect(() => {
    fetchInventory();
    fetchBranches();
  }, []);

  async function fetchInventory() {
    try {
      const { data, error } = await supabase
        .from('inventory')
        .select(`
          id,
          quantity,
          low_stock_threshold,
          branch:branches(id, name),
          variant:product_variants(
            id,
            size,
            color,
            product:products(id, name, sku)
          )
        `)
        .order('quantity');

      if (error) throw error;
      setInventory(data || []);
    } catch (error) {
      console.error('Error fetching inventory:', error);
      toast.error('Failed to load inventory');
    } finally {
      setLoading(false);
    }
  }

  async function fetchBranches() {
    try {
      const { data, error } = await supabase
        .from('branches')
        .select('id, name')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setBranches(data || []);
    } catch (error) {
      console.error('Error fetching branches:', error);
    }
  }

  const handleAdjustStock = (item: InventoryItem, type: 'in' | 'out') => {
    setSelectedInventory(item);
    setAdjustmentType(type);
    setAdjustmentQuantity('');
    setAdjustmentReason('');
    setIsAdjustDialogOpen(true);
  };

  const submitAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedInventory || !adjustmentQuantity) return;

    const quantity = parseInt(adjustmentQuantity);
    if (quantity <= 0) {
      toast.error('Quantity must be greater than 0');
      return;
    }

    if (adjustmentType === 'out' && quantity > selectedInventory.quantity) {
      toast.error('Cannot remove more than available stock');
      return;
    }

    try {
      const newQuantity =
        adjustmentType === 'in'
          ? selectedInventory.quantity + quantity
          : selectedInventory.quantity - quantity;

      // Update inventory
      const { error: updateError } = await supabase
        .from('inventory')
        .update({ quantity: newQuantity })
        .eq('id', selectedInventory.id);

      if (updateError) throw updateError;

      // Record movement
      const { error: movementError } = await supabase
        .from('stock_movements')
        .insert({
          inventory_id: selectedInventory.id,
          movement_type: adjustmentType,
          quantity: quantity,
          reason: adjustmentReason || null,
          performed_by: '2214933b-7c33-480e-9177-5b53a1e8d2d0',
        });

      if (movementError) throw movementError;

      toast.success(`Stock ${adjustmentType === 'in' ? 'added' : 'removed'} successfully`);
      setIsAdjustDialogOpen(false);
      fetchInventory();
    } catch (error: any) {
      console.error('Error adjusting stock:', error);
      toast.error(error.message || 'Failed to adjust stock');
    }
  };

  const filteredInventory = inventory.filter((item) => {
    const matchesSearch =
      item.variant?.product?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.variant?.product?.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesBranch =
      selectedBranch === 'all' || item.branch?.id === selectedBranch;
    const matchesLowStock =
      !showLowStock || item.quantity < item.low_stock_threshold;
    return matchesSearch && matchesBranch && matchesLowStock;
  });

  return (
    <>
      <Card>
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
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          ) : filteredInventory.length === 0 ? (
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
                {filteredInventory.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{item.variant?.product?.name}</p>
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
                    <TableCell className="font-medium">{item.quantity}</TableCell>
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

      <Dialog open={isAdjustDialogOpen} onOpenChange={setIsAdjustDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {adjustmentType === 'in' ? 'Add Stock' : 'Remove Stock'}
            </DialogTitle>
          </DialogHeader>
          {selectedInventory && (
            <form onSubmit={submitAdjustment} className="space-y-4">
              <div className="p-3 bg-muted rounded-lg">
                <p className="font-medium">{selectedInventory.variant?.product?.name}</p>
                <p className="text-sm text-muted-foreground">
                  {selectedInventory.variant?.size} / {selectedInventory.variant?.color} •{' '}
                  {selectedInventory.branch?.name}
                </p>
                <p className="text-sm mt-1">
                  Current stock: <span className="font-medium">{selectedInventory.quantity}</span>
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  max={adjustmentType === 'out' ? selectedInventory.quantity : undefined}
                  value={adjustmentQuantity}
                  onChange={(e) => setAdjustmentQuantity(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reason">Reason (optional)</Label>
                <Input
                  id="reason"
                  value={adjustmentReason}
                  onChange={(e) => setAdjustmentReason(e.target.value)}
                  placeholder={
                    adjustmentType === 'in'
                      ? 'e.g., New shipment, Return'
                      : 'e.g., Sold, Damaged, Lost'
                  }
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAdjustDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {adjustmentType === 'in' ? 'Add Stock' : 'Remove Stock'}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}


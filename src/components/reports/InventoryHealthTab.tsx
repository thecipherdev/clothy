import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Download, AlertTriangle } from 'lucide-react';
import { InventoryHealthItem, Branch } from '@/hooks/useReportsData';
import { exportToCSV } from '@/lib/export';

interface InventoryHealthTabProps {
  inventoryHealth: InventoryHealthItem[];
  branches: Branch[];
  loading: boolean;
}

export function InventoryHealthTab({ inventoryHealth, branches, loading }: InventoryHealthTabProps) {
  const [statusFilter, setStatusFilter] = useState<string>('low');
  const [branchFilter, setBranchFilter] = useState<string>('all');

  const filteredItems = inventoryHealth.filter((item) => {
    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'low' && (item.status === 'low' || item.status === 'critical')) ||
      item.status === statusFilter;
    const matchesBranch = branchFilter === 'all' || item.branch_id === branchFilter;
    return matchesStatus && matchesBranch;
  });

  const criticalCount = inventoryHealth.filter((i) => i.status === 'critical').length;
  const lowCount = inventoryHealth.filter((i) => i.status === 'low').length;

  const getStatusBadge = (status: 'critical' | 'low' | 'ok') => {
    switch (status) {
      case 'critical':
        return <Badge variant="destructive">Critical</Badge>;
      case 'low':
        return <Badge variant="secondary" className="bg-warning/20 text-warning-foreground dark:text-warning">Low</Badge>;
      default:
        return <Badge variant="outline">OK</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Alert Summary */}
      {(criticalCount > 0 || lowCount > 0) && (
        <Card className="border-warning/30 bg-warning/10">
          <CardContent className="py-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              <span className="font-medium">
                {criticalCount > 0 && <span className="text-destructive">{criticalCount} critical</span>}
                {criticalCount > 0 && lowCount > 0 && ' and '}
                {lowCount > 0 && <span className="text-warning">{lowCount} low stock</span>}
                {' items need attention'}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base">Inventory Health</CardTitle>
          <div className="flex items-center gap-2">
            <Select value={branchFilter} onValueChange={setBranchFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="All Branches" />
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
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Filter Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="low">Low & Critical</SelectItem>
                <SelectItem value="critical">Critical Only</SelectItem>
                <SelectItem value="ok">OK Only</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportToCSV(filteredItems.map(item => ({
                Product: item.product_name,
                Variant: item.variant_label,
                SKU: item.sku,
                Branch: item.branch_name,
                'Current Stock': item.current_stock,
                'Reorder Threshold': item.reorder_threshold,
                Status: item.status.toUpperCase(),
              })), 'inventory-health')}
            >
              <Download className="h-4 w-4 mr-1" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {filteredItems.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {statusFilter === 'low' ? 'No low stock items found' : 'No items match the current filters'}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Branch</TableHead>
                  <TableHead className="text-right">Stock</TableHead>
                  <TableHead className="text-right">Threshold</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.slice(0, 50).map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{item.product_name}</div>
                        <div className="text-sm text-muted-foreground">{item.variant_label}</div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{item.sku}</TableCell>
                    <TableCell>{item.branch_name}</TableCell>
                    <TableCell className="text-right font-medium">{item.current_stock}</TableCell>
                    <TableCell className="text-right text-muted-foreground">{item.reorder_threshold}</TableCell>
                    <TableCell>{getStatusBadge(item.status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          {filteredItems.length > 50 && (
            <p className="text-sm text-muted-foreground text-center mt-4">
              Showing 50 of {filteredItems.length} items. Export to see all.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

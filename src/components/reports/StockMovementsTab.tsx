import {
  ArrowDownLeft,
  ArrowLeftRight,
  ArrowUpRight,
  Download,
} from 'lucide-react'
import { format } from 'date-fns'
import type {
  Branch,
  StockMovementItem,
  StockMovementSummary,
} from '@/hooks/useReportsData'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { exportToCSV } from '@/lib/export'

interface StockMovementsTabProps {
  movements: Array<StockMovementItem>
  summary: StockMovementSummary
  branches: Array<Branch>
  dateRange: string
  setDateRange: (value: string) => void
  selectedBranch: string
  setSelectedBranch: (value: string) => void
  loading: boolean
}

export function StockMovementsTab({
  movements,
  summary,
  branches,
  dateRange,
  setDateRange,
  selectedBranch,
  setSelectedBranch,
  loading,
}: StockMovementsTabProps) {
  const getMovementTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      purchase_received: 'Purchase Received',
      adjustment_add: 'Stock Added',
      adjustment_remove: 'Stock Removed',
      transfer_in: 'Transfer In',
      transfer_out: 'Transfer Out',
    }
    return labels[type] || type
  }

  const getMovementBadge = (type: string, quantity: number) => {
    if (type.includes('transfer')) {
      return (
        <Badge variant="outline" className="gap-1">
          <ArrowLeftRight className="h-3 w-3" />
          Transfer
        </Badge>
      )
    }
    if (quantity > 0) {
      return (
        <Badge className="gap-1 bg-success/20 text-success">
          <ArrowDownLeft className="h-3 w-3" />
          IN
        </Badge>
      )
    }
    return (
      <Badge
        variant="secondary"
        className="gap-1 bg-destructive/20 text-destructive"
      >
        <ArrowUpRight className="h-3 w-3" />
        OUT
      </Badge>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-success/20">
                <ArrowDownLeft className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Stock In</p>
                <p className="text-2xl font-bold">
                  {summary.stock_in.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-destructive/20">
                <ArrowUpRight className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Stock Out</p>
                <p className="text-2xl font-bold">
                  {summary.stock_out.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-info/20">
                <ArrowLeftRight className="h-5 w-5 text-info" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Transfers</p>
                <p className="text-2xl font-bold">
                  {summary.transfers.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Movements Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base">Movement History</CardTitle>
          <div className="flex items-center gap-2">
            <Select value={selectedBranch} onValueChange={setSelectedBranch}>
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
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Date Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                exportToCSV(
                  movements.map((m) => ({
                    Date: format(new Date(m.date), 'yyyy-MM-dd HH:mm'),
                    Product: m.product_name,
                    Variant: m.variant_label,
                    Type: getMovementTypeLabel(m.movement_type),
                    Quantity: m.quantity,
                    Branch: m.branch_name,
                  })),
                  'stock-movements',
                )
              }
            >
              <Download className="h-4 w-4 mr-1" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {movements.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No movements found for the selected period
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead>Branch</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {movements.slice(0, 50).map((movement) => (
                  <TableRow key={movement.id}>
                    <TableCell className="text-muted-foreground">
                      {format(new Date(movement.date), 'MMM d, yyyy HH:mm')}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {movement.product_name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {movement.variant_label}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getMovementBadge(
                        movement.movement_type,
                        movement.quantity,
                      )}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      <span
                        className={
                          movement.quantity > 0
                            ? 'text-success'
                            : 'text-destructive'
                        }
                      >
                        {movement.quantity > 0 ? '+' : ''}
                        {movement.quantity}
                      </span>
                    </TableCell>
                    <TableCell>{movement.branch_name}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          {movements.length > 50 && (
            <p className="text-sm text-muted-foreground text-center mt-4">
              Showing 50 of {movements.length} movements. Export to see all.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

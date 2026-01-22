import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Download, DollarSign } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { BranchStock, CategoryStock } from '@/hooks/useReportsData';
import { exportToCSV } from '@/lib/export';

interface InventoryValueTabProps {
  branchStock: BranchStock[];
  categoryStock: CategoryStock[];
  totalValue: number;
  loading: boolean;
}

export function InventoryValueTab({ branchStock, categoryStock, totalValue, loading }: InventoryValueTabProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Total Value Card */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-primary/10">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Inventory Value</p>
                <p className="text-3xl font-bold">{formatCurrency(totalValue)}</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportToCSV([
                ...branchStock.map(b => ({
                  Type: 'Branch',
                  Name: b.branch_name,
                  Value: b.total_value.toFixed(2),
                })),
                ...categoryStock.map(c => ({
                  Type: 'Category',
                  Name: c.category_name,
                  Value: c.total_value.toFixed(2),
                })),
              ], 'inventory-value')}
            >
              <Download className="h-4 w-4 mr-1" />
              Export All
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Value by Branch */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Value by Branch</CardTitle>
          </CardHeader>
          <CardContent>
            {branchStock.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-muted-foreground">
                No data available
              </div>
            ) : (
              <>
                <div className="h-48 mb-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={branchStock} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis type="number" tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} className="text-xs" />
                      <YAxis dataKey="branch_name" type="category" width={80} className="text-xs" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--background))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                        formatter={(value: number) => [formatCurrency(value), 'Value']}
                      />
                      <Bar dataKey="total_value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Branch</TableHead>
                      <TableHead className="text-right">Units</TableHead>
                      <TableHead className="text-right">Value</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {branchStock.map((item) => (
                      <TableRow key={item.branch_id}>
                        <TableCell className="font-medium">{item.branch_name}</TableCell>
                        <TableCell className="text-right">{item.total_quantity.toLocaleString()}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.total_value)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </>
            )}
          </CardContent>
        </Card>

        {/* Value by Category */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Value by Category</CardTitle>
          </CardHeader>
          <CardContent>
            {categoryStock.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-muted-foreground">
                No data available
              </div>
            ) : (
              <>
                <div className="h-48 mb-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={categoryStock} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis type="number" tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} className="text-xs" />
                      <YAxis dataKey="category_name" type="category" width={100} className="text-xs" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--background))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                        formatter={(value: number) => [formatCurrency(value), 'Value']}
                      />
                      <Bar dataKey="total_value" fill="hsl(var(--chart-2))" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Category</TableHead>
                      <TableHead className="text-right">Units</TableHead>
                      <TableHead className="text-right">Value</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categoryStock.map((item, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-medium">{item.category_name}</TableCell>
                        <TableCell className="text-right">{item.total_quantity.toLocaleString()}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.total_value)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

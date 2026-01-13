import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { BarChart3, Download, Store } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

interface BranchStock {
  branch_name: string;
  total_quantity: number;
  total_value: number;
}

interface CategoryStock {
  category_name: string;
  total_quantity: number;
}

interface Branch {
  id: string;
  name: string;
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export const Route = createFileRoute('/(app)/reports')({
  component: RouteComponent,
})

function RouteComponent() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<string>('all');
  const [branchStock, setBranchStock] = useState<BranchStock[]>([]);
  const [categoryStock, setCategoryStock] = useState<CategoryStock[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBranches();
    fetchReportData();
  }, []);

  async function fetchBranches() {
    const { data } = await supabase
      .from('branches')
      .select('id, name')
      .eq('is_active', true)
      .order('name');
    setBranches(data || []);
  }

  async function fetchReportData() {
    try {
      // Fetch stock by branch
      const { data: inventoryData } = await supabase
        .from('inventory')
        .select(`
          quantity,
          branch:branches(name),
          variant:product_variants(
            product:products(price)
          )
        `);

      const branchTotals: Record<string, { quantity: number; value: number }> = {};
      (inventoryData || []).forEach((item: any) => {
        const branchName = item.branch?.name || 'Unknown';
        const price = item.variant?.product?.price || 0;
        if (!branchTotals[branchName]) {
          branchTotals[branchName] = { quantity: 0, value: 0 };
        }
        branchTotals[branchName].quantity += item.quantity;
        branchTotals[branchName].value += item.quantity * price;
      });

      const branchStockData: BranchStock[] = Object.entries(branchTotals).map(
        ([name, data]) => ({
          branch_name: name,
          total_quantity: data.quantity,
          total_value: data.value,
        })
      );
      setBranchStock(branchStockData);

      // Fetch stock by category
      const { data: categoryData } = await supabase
        .from('inventory')
        .select(`
          quantity,
          variant:product_variants(
            product:products(
              categories(name)
            )
          )
        `);

      const categoryTotals: Record<string, number> = {};
      (categoryData || []).forEach((item: any) => {
        const categoryName = item.variant?.product?.categories?.name || 'Uncategorized';
        if (!categoryTotals[categoryName]) {
          categoryTotals[categoryName] = 0;
        }
        categoryTotals[categoryName] += item.quantity;
      });

      const categoryStockData: CategoryStock[] = Object.entries(categoryTotals).map(
        ([name, quantity]) => ({
          category_name: name,
          total_quantity: quantity,
        })
      );
      setCategoryStock(categoryStockData);
    } catch (error) {
      console.error('Error fetching report data:', error);
      toast.error('Failed to load report data');
    } finally {
      setLoading(false);
    }
  }

  const exportToCSV = (data: any[], filename: string) => {
    const headers = Object.keys(data[0] || {}).join(',');
    const rows = data.map((row) => Object.values(row).join(','));
    const csv = [headers, ...rows].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Tabs defaultValue="overview" className="space-y-4">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="by-branch">By Branch</TabsTrigger>
        <TabsTrigger value="by-category">By Category</TabsTrigger>
      </TabsList>

      <TabsContent value="overview">
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Stock by Branch</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => exportToCSV(branchStock, 'stock-by-branch')}
              >
                <Download className="h-4 w-4 mr-1" />
                Export
              </Button>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-64 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
              ) : branchStock.length === 0 ? (
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  No data available
                </div>
              ) : (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={branchStock}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="branch_name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="total_quantity" fill="hsl(var(--primary))" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Stock by Category</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => exportToCSV(categoryStock, 'stock-by-category')}
              >
                <Download className="h-4 w-4 mr-1" />
                Export
              </Button>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-64 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
              ) : categoryStock.length === 0 ? (
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  No data available
                </div>
              ) : (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryStock}
                        dataKey="total_quantity"
                        nameKey="category_name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label={({ category_name }) => category_name}
                      >
                        {categoryStock.map((_, index) => (
                          <Cell key={index} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="by-branch">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Store className="h-4 w-4" />
              Stock Levels by Branch
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportToCSV(branchStock, 'branch-stock-report')}
            >
              <Download className="h-4 w-4 mr-1" />
              Export CSV
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Branch</TableHead>
                    <TableHead>Total Units</TableHead>
                    <TableHead>Total Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {branchStock.map((item, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-medium">{item.branch_name}</TableCell>
                      <TableCell>{item.total_quantity.toLocaleString()}</TableCell>
                      <TableCell>${item.total_value.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="by-category">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Stock Levels by Category
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportToCSV(categoryStock, 'category-stock-report')}
            >
              <Download className="h-4 w-4 mr-1" />
              Export CSV
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category</TableHead>
                    <TableHead>Total Units</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categoryStock.map((item, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-medium">{item.category_name}</TableCell>
                      <TableCell>{item.total_quantity.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}

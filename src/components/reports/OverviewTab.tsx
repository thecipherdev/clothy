import { Download } from 'lucide-react'
import { getRouteApi } from '@tanstack/react-router'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { UseNavigateResult } from '@tanstack/react-router';
import type { BranchStock, CategoryStock } from '@/hooks/useReportsData'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { exportToCSV } from '@/lib/export'

interface OverviewTabProps {
  branchStock: Array<BranchStock>
  categoryStock: Array<CategoryStock>
  loading: boolean
  navigate: UseNavigateResult<'/reports'>
}

const COLORS = [
  'var(--primary)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
  'var(--accent)',
]

// const routeApi = getRouteApi('/(app)/inventory')

export function OverviewTab({
  branchStock,
  categoryStock,
  loading,
  navigate,
}: OverviewTabProps) {
  const totalStock = categoryStock.reduce((sum, c) => sum + c.total_quantity, 0)
  const categoryWithPercent = categoryStock.map((c) => ({
    ...c,
    percent:
      totalStock > 0 ? ((c.total_quantity / totalStock) * 100).toFixed(1) : 0,
  }))

  const handleBranchClick = (data: any) => {
    if (data?.branch_id) {
      navigate({
        to: '/inventory',
        search: () => ({ branchId: data?.branch_id }),
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Stock by Branch */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="text-base">Stock by Branch</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Click a bar to view inventory
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              exportToCSV(
                branchStock.map((b) => ({
                  Branch: b.branch_name,
                  'Total Units': b.total_quantity,
                  'Total Value': b.total_value.toFixed(2),
                })),
                'stock-by-branch',
              )
            }
          >
            <Download className="h-4 w-4 mr-1" />
            Export
          </Button>
        </CardHeader>
        <CardContent>
          {branchStock.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              No data available
            </div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={branchStock}
                  onClick={(e) =>
                    handleBranchClick(e?.activePayload?.[0]?.payload)
                  }
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-border"
                  />
                  <XAxis dataKey="branch_name" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--background)',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number) => [
                      value.toLocaleString(),
                      'Units',
                    ]}
                  />
                  <Bar
                    dataKey="total_quantity"
                    fill="var(--primary)"
                    radius={[4, 4, 0, 0]}
                    cursor="pointer"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stock by Category */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="text-base">Stock by Category</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Distribution across categories
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              exportToCSV(
                categoryWithPercent.map((c) => ({
                  Category: c.category_name,
                  'Total Units': c.total_quantity,
                  Percentage: `${c.percent}%`,
                })),
                'stock-by-category',
              )
            }
          >
            <Download className="h-4 w-4 mr-1" />
            Export
          </Button>
        </CardHeader>
        <CardContent>
          {categoryStock.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              No data available
            </div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryWithPercent}
                    dataKey="total_quantity"
                    nameKey="category_name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ category_name, percent }) =>
                      `${category_name} (${percent}%)`
                    }
                    labelLine={false}
                  >
                    {categoryWithPercent.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number, name: string) => [
                      value.toLocaleString(),
                      name,
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

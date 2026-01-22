import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface BranchStock {
  branch_id: string;
  branch_name: string;
  total_quantity: number;
  total_value: number;
}

export interface CategoryStock {
  category_name: string;
  total_quantity: number;
  total_value: number;
}

export interface InventoryHealthItem {
  id: string;
  product_name: string;
  variant_label: string;
  sku: string;
  branch_name: string;
  branch_id: string;
  current_stock: number;
  reorder_threshold: number;
  status: 'critical' | 'low' | 'ok';
  unit_price: number;
}

export interface StockMovementSummary {
  stock_in: number;
  stock_out: number;
  transfers: number;
}

export interface StockMovementItem {
  id: string;
  date: string;
  product_name: string;
  variant_label: string;
  movement_type: string;
  quantity: number;
  branch_name: string;
}

export interface Branch {
  id: string;
  name: string;
}

export function useReportsData() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [branchStock, setBranchStock] = useState<BranchStock[]>([]);
  const [categoryStock, setCategoryStock] = useState<CategoryStock[]>([]);
  const [inventoryHealth, setInventoryHealth] = useState<InventoryHealthItem[]>([]);
  const [stockMovements, setStockMovements] = useState<StockMovementItem[]>([]);
  const [movementSummary, setMovementSummary] = useState<StockMovementSummary>({ stock_in: 0, stock_out: 0, transfers: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedBranch, setSelectedBranch] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('30');

  useEffect(() => {
    fetchAllData();
  }, []);

  useEffect(() => {
    fetchMovementsData();
  }, [dateRange, selectedBranch]);

  async function fetchAllData() {
    setLoading(true);
    await Promise.all([
      fetchBranches(),
      fetchStockByBranch(),
      fetchStockByCategory(),
      fetchInventoryHealth(),
      fetchMovementsData(),
    ]);
    setLoading(false);
  }

  async function fetchBranches() {
    const { data } = await supabase
      .from('branches')
      .select('id, name')
      .eq('is_active', true)
      .order('name');
    setBranches(data || []);
  }

  async function fetchStockByBranch() {
    try {
      const { data: inventoryData } = await supabase
        .from('inventory')
        .select(`
          quantity,
          branch_id,
          branch:branches(id, name),
          variant:product_variants(
            product:products(price)
          )
        `);

      const branchTotals: Record<string, { id: string; quantity: number; value: number }> = {};
      (inventoryData || []).forEach((item: any) => {
        const branchId = item.branch?.id || 'unknown';
        const branchName = item.branch?.name || 'Unknown';
        const price = item.variant?.product?.price || 0;
        if (!branchTotals[branchName]) {
          branchTotals[branchName] = { id: branchId, quantity: 0, value: 0 };
        }
        branchTotals[branchName].quantity += item.quantity;
        branchTotals[branchName].value += item.quantity * price;
      });

      const branchStockData: BranchStock[] = Object.entries(branchTotals).map(
        ([name, data]) => ({
          branch_id: data.id,
          branch_name: name,
          total_quantity: data.quantity,
          total_value: data.value,
        })
      );
      setBranchStock(branchStockData);
    } catch (error) {
      console.error('Error fetching branch stock:', error);
    }
  }

  async function fetchStockByCategory() {
    try {
      const { data: categoryData } = await supabase
        .from('inventory')
        .select(`
          quantity,
          variant:product_variants(
            product:products(
              price,
              categories(name)
            )
          )
        `);

      const categoryTotals: Record<string, { quantity: number; value: number }> = {};
      (categoryData || []).forEach((item: any) => {
        const categoryName = item.variant?.product?.categories?.name || 'Uncategorized';
        const price = item.variant?.product?.price || 0;
        if (!categoryTotals[categoryName]) {
          categoryTotals[categoryName] = { quantity: 0, value: 0 };
        }
        categoryTotals[categoryName].quantity += item.quantity;
        categoryTotals[categoryName].value += item.quantity * price;
      });

      const categoryStockData: CategoryStock[] = Object.entries(categoryTotals).map(
        ([name, data]) => ({
          category_name: name,
          total_quantity: data.quantity,
          total_value: data.value,
        })
      );
      setCategoryStock(categoryStockData);
    } catch (error) {
      console.error('Error fetching category stock:', error);
    }
  }

  async function fetchInventoryHealth() {
    try {
      const { data } = await supabase
        .from('inventory')
        .select(`
          id,
          quantity,
          low_stock_threshold,
          branch_id,
          branch:branches(id, name),
          variant:product_variants(
            size,
            color,
            product:products(name, sku, price)
          )
        `)
        .order('quantity', { ascending: true });

      const healthItems: InventoryHealthItem[] = (data || []).map((item: any) => {
        const quantity = item.quantity;
        const threshold = item.low_stock_threshold;
        let status: 'critical' | 'low' | 'ok' = 'ok';
        if (quantity === 0) {
          status = 'critical';
        } else if (quantity <= threshold) {
          status = 'low';
        }

        return {
          id: item.id,
          product_name: item.variant?.product?.name || 'Unknown',
          variant_label: `${item.variant?.size || ''} / ${item.variant?.color || ''}`,
          sku: item.variant?.product?.sku || '',
          branch_name: item.branch?.name || 'Unknown',
          branch_id: item.branch?.id || '',
          current_stock: quantity,
          reorder_threshold: threshold,
          status,
          unit_price: item.variant?.product?.price || 0,
        };
      });

      setInventoryHealth(healthItems);
    } catch (error) {
      console.error('Error fetching inventory health:', error);
    }
  }

  async function fetchMovementsData() {
    try {
      const daysAgo = parseInt(dateRange);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysAgo);

      let query = supabase
        .from('stock_movements')
        .select(`
          id,
          created_at,
          movement_type,
          quantity,
          inventory:inventory_id(
            branch:branches(id, name),
            variant:product_variants(
              size,
              color,
              product:products(name)
            )
          )
        `)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false });

      const { data } = await query;

      let stockIn = 0;
      let stockOut = 0;
      let transfers = 0;

      const movements: StockMovementItem[] = (data || []).map((item: any) => {
        const type = item.movement_type;
        const qty = Math.abs(item.quantity);

        if (type === 'purchase_received' || type === 'adjustment_add' || type === 'transfer_in') {
          stockIn += qty;
        } else if (type === 'adjustment_remove' || type === 'transfer_out') {
          stockOut += qty;
        }
        if (type === 'transfer_in' || type === 'transfer_out') {
          transfers += qty / 2; // Count transfers once, not twice
        }

        const branchId = item.inventory?.branch?.id || '';
        const branchName = item.inventory?.branch?.name || 'Unknown';

        // Filter by branch if selected
        if (selectedBranch !== 'all' && branchId !== selectedBranch) {
          return null;
        }

        return {
          id: item.id,
          date: item.created_at,
          product_name: item.inventory?.variant?.product?.name || 'Unknown',
          variant_label: `${item.inventory?.variant?.size || ''} / ${item.inventory?.variant?.color || ''}`,
          movement_type: type,
          quantity: item.quantity,
          branch_name: branchName,
        };
      }).filter(Boolean) as StockMovementItem[];

      setStockMovements(movements);
      setMovementSummary({ stock_in: stockIn, stock_out: stockOut, transfers: Math.floor(transfers) });
    } catch (error) {
      console.error('Error fetching movements:', error);
    }
  }

  const totalInventoryValue = branchStock.reduce((sum, b) => sum + b.total_value, 0);

  return {
    branches,
    branchStock,
    categoryStock,
    inventoryHealth,
    stockMovements,
    movementSummary,
    totalInventoryValue,
    loading,
    selectedBranch,
    setSelectedBranch,
    dateRange,
    setDateRange,
    refetch: fetchAllData,
  };
}

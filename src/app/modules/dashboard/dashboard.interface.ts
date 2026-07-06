export interface IDashboardLowStockProduct {
  _id: string;
  name: string;
  sku: string;
  stockQuantity: number;
}

export interface IDashboardSummary {
  totalProducts: number;
  totalCustomers: number;
  totalSales: number;
  lowStockProducts: IDashboardLowStockProduct[];
}
import { Types } from 'mongoose';

export interface IDashboardLowStockProduct {
  _id: Types.ObjectId;
  name: string;
  sku: string;
  stockQuantity: number;
}

export interface IDashboardSummary {
  totalProducts: number;
  totalCustomers: number;
  totalSales: number;
  totalSalesAmount: number;
  lowStockProducts: IDashboardLowStockProduct[];
}

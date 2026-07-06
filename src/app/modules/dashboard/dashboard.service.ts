
import { Customer } from '../customer/customer.models';
import { Product } from '../product/product.models';
import { lowStockFilter } from '../product/product.utils';
import { Sale } from '../sale/sale.models';
import { IDashboardSummary } from './dashboard.interface';

/**
 * getSummary
 * All four figures are independent reads (no shared transaction needed —
 * this is a read-only reporting endpoint, not a business-rule mutation),
 * so they run concurrently for speed.
 */
const getSummary = async (): Promise<IDashboardSummary> => {
  const [
    totalProducts,
    totalCustomers,
    totalSales,
    totalSalesAmount,
    lowStockProducts,
  ] = await Promise.all([
    Product.countDocuments({ isDeleted: false }),
    Customer.countDocuments({ isDeleted: false }),
    Sale.countDocuments(),

    Sale.aggregate([
      {
        $group: {
          _id: null,
          totalSalesAmount: { $sum: '$grandTotal' },
        },
      },
    ]),

    Product.find(lowStockFilter())
      .select('name sku stockQuantity')
      .sort('stockQuantity')
      .lean(),
  ]);

  return {
    totalProducts,
    totalCustomers,
    totalSales,
    totalSalesAmount: totalSalesAmount[0]?.totalSalesAmount ?? 0,
    lowStockProducts,
  };
};

export const dashboardService = {
  getSummary,
};
import { ClientSession } from 'mongoose';

import { IProductDocument } from './product.interface';
import { PRODUCT_VALIDATION } from './product.constants';
import { HTTP_STATUS_CODE } from '../../utils/HTTP_STATUS_CODE';
import AppError from '../../errorHelpers/AppError';
import { Product } from './product.models';

/**
 * assertProductExists
 * Used by SaleService before creating a Sale. Accepts an optional
 * transaction session so the read participates in the Sale's atomicity.
 */
export const assertProductExists = async (
  productId: string,
  session?: ClientSession,
): Promise<IProductDocument> => {
  const product = await Product.findOne({ _id: productId, isDeleted: false }).session(
    session ?? null,
  );

  if (!product) {
    throw new AppError(HTTP_STATUS_CODE.NOT_FOUND, 'Product not found');
  }

  return product;
};

/**
 * lowStockFilter
 * Shared by DashboardService — keeps the "low stock" threshold defined
 * in exactly one place (PRODUCT_VALIDATION).
 */
export const lowStockFilter = () => ({
  isDeleted: false,
  stockQuantity: { $lt: PRODUCT_VALIDATION.LOW_STOCK_THRESHOLD },
});
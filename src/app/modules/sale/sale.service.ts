import mongoose from 'mongoose';
import { ICreateSalePayload, ISaleProductEntry } from './sale.interface';
import { calculateGrandTotal } from './sale.utils';
import { assertProductExists } from '../product/product.utils';
import { assertCustomerExists } from '../customer/customer.utils';
import { SALE_DATE_RANGE_FIELD } from './sale.constants';
import AppError from '../../errorHelpers/AppError';
import { HTTP_STATUS_CODE } from '../../utils/HTTP_STATUS_CODE';
import { Sale } from './sale.models';
import { QueryBuilder } from '../../builder/QueryBuilder';

/**
 * createSale
 * Rule 11: Sale creation + stock reduction must be atomic — wrapped in a
 * single Mongo transaction. If anything fails, everything rolls back,
 * including any stock already decremented earlier in the loop.
 */
const createSale = async (payload: ICreateSalePayload, createdBy: string) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    // Rule 3 (customer part) — Customer must exist
    await assertCustomerExists(payload.customer, session);

    const saleProducts: ISaleProductEntry[] = [];

    for (const item of payload.products) {
      // Rule 3 (quantity part) — defensive re-check even though zod enforces it
      if (item.quantity <= 0) {
        throw new AppError(HTTP_STATUS_CODE.BAD_REQUEST, 'Quantity must be greater than 0');
      }

      // Rule 3/4 — Product must exist and not be soft-deleted
      const product = await assertProductExists(item.product, session);

      // Rule 5 — Prevent insufficient stock
      if (product.stockQuantity < item.quantity) {
        throw new AppError(
          HTTP_STATUS_CODE.BAD_REQUEST,
          `Insufficient stock for "${product.name}". Available: ${product.stockQuantity}`,
        );
      }

      saleProducts.push({
        product: product._id,
        quantity: item.quantity,
        unitPrice: product.sellingPrice, // server-captured price, never client-supplied
      });

      // Rule 6 — reduce stock atomically, inside the same transaction
      product.stockQuantity -= item.quantity;
      await product.save({ session });
    }

    // Rule 7 — grand total always computed on backend
    const grandTotal = calculateGrandTotal(saleProducts);

    const [sale] = await Sale.create(
      [
        {
          customer: payload.customer,
          products: saleProducts,
          grandTotal,
          createdBy, // Rule 10 — store User reference
        },
      ],
      { session },
    );

    await session.commitTransaction();
    return sale;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

const getAllSales = async (query: Record<string, string>) => {
  const queryBuilder = new QueryBuilder(
    Sale.find()
      .populate('customer', 'name phone')
      .populate('createdBy', 'name role')
      .populate('products.product', 'name sku'),
    query,
  );

  const salesQuery = queryBuilder
    .filter()
    .rangeFilter([{ field: SALE_DATE_RANGE_FIELD, min: 'startDate', max: 'endDate' }])
    .sort()
    .fields()
    .paginate();

  const [result, meta] = await Promise.all([salesQuery.build(), queryBuilder.getMeta()]);

  return { result, meta };
};

const getSingleSale = async (id: string) => {
  const sale = await Sale.findById(id)
    .populate('customer', 'name phone email')
    .populate('createdBy', 'name role')
    .populate('products.product', 'name sku sellingPrice');

  if (!sale) {
    throw new AppError(HTTP_STATUS_CODE.NOT_FOUND, 'Sale not found');
  }

  return sale;
};

export const saleService = {
  createSale,
  getAllSales,
  getSingleSale,
};
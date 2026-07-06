import { ISaleProductEntry } from './sale.interface';

/**
 * calculateGrandTotal
 * The single source of truth for a Sale's total — called only in
 * SaleService, never accepted from the client (Business Rule 7).
 */
export const calculateGrandTotal = (products: ISaleProductEntry[]): number =>
  products.reduce((total, item) => total + item.quantity * item.unitPrice, 0);
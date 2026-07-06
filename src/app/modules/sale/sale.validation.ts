import { z } from 'zod';
import { Types } from 'mongoose';
import { mongoIdSchema } from '../../shared/schemas/mongoIdSchema';

const saleProductItemSchema = z
  .object({
    product: mongoIdSchema,
    quantity: z.number().int().positive('Quantity must be greater than 0'),
  })
  .strict();

export const createSaleValidationSchema = z
  .object({
    customer: mongoIdSchema,
    products: z
      .array(saleProductItemSchema)
      .min(1, 'At least one product is required'),
  })
  .strict();

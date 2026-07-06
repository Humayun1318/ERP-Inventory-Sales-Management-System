import { z } from 'zod';
import { CUSTOMER_VALIDATION } from './customer.constants';

export const createCustomerZodSchema = z
  .object({
    name: z
      .string()
      .min(CUSTOMER_VALIDATION.NAME_MIN_LENGTH)
      .max(CUSTOMER_VALIDATION.NAME_MAX_LENGTH)
      .trim(),
    phone: z
      .string()
      .min(CUSTOMER_VALIDATION.PHONE_MIN_LENGTH)
      .max(CUSTOMER_VALIDATION.PHONE_MAX_LENGTH)
      .trim(),
    email: z.string().email().trim().optional(),
    address: z.string().max(CUSTOMER_VALIDATION.ADDRESS_MAX_LENGTH).trim().optional(),
  })
  .strict();

export const updateCustomerZodSchema = createCustomerZodSchema.partial();
import { z } from 'zod';
import { PRODUCT_VALIDATION } from './product.constants';

export const createProductValidationSchema = z
  .object({
    name: z
      .string()
      .min(PRODUCT_VALIDATION.NAME_MIN_LENGTH)
      .max(PRODUCT_VALIDATION.NAME_MAX_LENGTH)
      .trim(),
    sku: z
      .string()
      .min(PRODUCT_VALIDATION.SKU_MIN_LENGTH)
      .max(PRODUCT_VALIDATION.SKU_MAX_LENGTH)
      .trim(),
    category: z
      .string()
      .min(PRODUCT_VALIDATION.CATEGORY_MIN_LENGTH)
      .max(PRODUCT_VALIDATION.CATEGORY_MAX_LENGTH)
      .trim(),
    purchasePrice: z.number().nonnegative('Purchase price cannot be negative'),
    sellingPrice: z.number().nonnegative('Selling price cannot be negative'),
    stockQuantity: z
      .number()
      .int()
      .nonnegative('Stock quantity cannot be negative'),
    images: z.array(z.url()).optional(),
    deletedImageUrls: z.array(z.url()).optional(),
  })
  .strict();

export const updateProductValidationSchema =
  createProductValidationSchema.partial();

export const getProductsQuerySchema = z
  .strictObject(
    {
      //-----------------------------
      // Search
      //-----------------------------
      searchTerm: z.string().trim().optional(),

      //-----------------------------
      // Filtering
      //-----------------------------
      category: z.string().trim().optional(),

      //-----------------------------
      // Selling Price Range
      //-----------------------------
      minSellingPrice: z.coerce.number().min(0).optional(),
      maxSellingPrice: z.coerce.number().min(0).optional(),

      //-----------------------------
      // Purchase Price Range
      //-----------------------------
      minPurchasePrice: z.coerce.number().min(0).optional(),
      maxPurchasePrice: z.coerce.number().min(0).optional(),

      //-----------------------------
      // Stock Range
      //-----------------------------
      minStock: z.coerce.number().int().min(0).optional(),
      maxStock: z.coerce.number().int().min(0).optional(),

      //-----------------------------
      // Pagination
      //-----------------------------
      page: z.coerce.number().int().positive().optional(),
      limit: z.coerce.number().int().positive().optional(),

      //-----------------------------
      // Sorting
      //-----------------------------
      sort: z
        .string()
        .optional()
        .refine(
          (value) => {
            if (!value) return true;

            const allowed = [
              'name',
              'category',
              'sellingPrice',
              'purchasePrice',
              'stockQuantity',
              'createdAt',
            ];

            return value.split(',').every((field) => {
              const clean = field.startsWith('-') ? field.slice(1) : field;
              return allowed.includes(clean);
            });
          },
          {
            message: 'Invalid sort field.',
          },
        ),

      //-----------------------------
      // Field Selection
      //-----------------------------
      fields: z.string().trim().optional(),
    },
    {
      error: (issue) => {
        if (issue.code === 'unrecognized_keys') {
          return {
            message: `Unknown query parameter: ${issue.keys.join(', ')}`,
          };
        }
      },
    },
  )

  //-----------------------------
  // Selling Price Validation
  //-----------------------------
  .refine(
    (data) =>
      data.minSellingPrice === undefined ||
      data.maxSellingPrice === undefined ||
      data.minSellingPrice <= data.maxSellingPrice,
    {
      path: ['minSellingPrice'],
      message: 'minSellingPrice must be less than or equal to maxSellingPrice.',
    },
  )

  //-----------------------------
  // Purchase Price Validation
  //-----------------------------
  .refine(
    (data) =>
      data.minPurchasePrice === undefined ||
      data.maxPurchasePrice === undefined ||
      data.minPurchasePrice <= data.maxPurchasePrice,
    {
      path: ['minPurchasePrice'],
      message:
        'minPurchasePrice must be less than or equal to maxPurchasePrice.',
    },
  )

  //-----------------------------
  // Stock Validation
  //-----------------------------
  .refine(
    (data) =>
      data.minStock === undefined ||
      data.maxStock === undefined ||
      data.minStock <= data.maxStock,
    {
      path: ['minStock'],
      message: 'minStock must be less than or equal to maxStock.',
    },
  );

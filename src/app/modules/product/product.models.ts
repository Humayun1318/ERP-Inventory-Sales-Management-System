import { Schema, model } from 'mongoose';
import { IProductDocument, IProductModel } from './product.interface';

const productSchema = new Schema<IProductDocument, IProductModel>(
  {
    name: { type: String, required: true, trim: true },
    sku: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    category: { type: String, required: true, trim: true },
    purchasePrice: { type: Number, required: true, min: 0 },
    sellingPrice: { type: Number, required: true, min: 0 },
    stockQuantity: { type: Number, required: true, min: 0, default: 0 },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true, versionKey: false },
);

// ─────────────────────────────────────────────────────────────────────────────
// Static methods
// ─────────────────────────────────────────────────────────────────────────────
productSchema.statics.isSkuTaken = async function (
  sku: string,
  excludeProductId?: string,
): Promise<boolean> {
  const query: Record<string, unknown> = { sku: sku.toUpperCase().trim() };
  if (excludeProductId) {
    query._id = { $ne: excludeProductId };
  }
  const product = await this.findOne(query).select('_id');
  return !!product;
};

export const Product = model<IProductDocument, IProductModel>('Product', productSchema);
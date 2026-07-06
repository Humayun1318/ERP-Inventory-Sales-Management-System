import { Schema, model } from 'mongoose';
import { ISaleDocument, ISaleModel } from './sale.interface';

const saleProductSchema = new Schema(
  {
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
  },
  { _id: false, versionKey: false },
);

const saleSchema = new Schema<ISaleDocument, ISaleModel>(
  {
    customer: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
    products: {
      type: [saleProductSchema],
      required: true,
      validate: {
        validator: (value: unknown[]) => Array.isArray(value) && value.length > 0,
        message: 'A sale must contain at least one product',
      },
    },
    grandTotal: { type: Number, required: true, min: 0 },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true, versionKey: false },
);

export const Sale = model<ISaleDocument, ISaleModel>('Sale', saleSchema);
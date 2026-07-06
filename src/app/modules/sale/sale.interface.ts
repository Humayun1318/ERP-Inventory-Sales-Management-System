import { Document, Model, Types } from 'mongoose';

export interface ISaleProductEntry {
  product: Types.ObjectId;
  quantity: number;
  unitPrice: number;
}

export interface ISale {
  _id?: Types.ObjectId;
  customer: Types.ObjectId;
  products: ISaleProductEntry[];
  grandTotal: number;
  createdBy: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ISaleDocument extends ISale, Document {
  _id: Types.ObjectId;
}

export type ISaleModel = Model<ISaleDocument>;

/**
 * ICreateSalePayload
 * What the client is allowed to send. Notice: no unitPrice, no grandTotal.
 * The server always looks up the Product's current sellingPrice itself
 * (Business Rule 7 — never trust the frontend for money values), which also
 * naturally satisfies Rules 3-6 since the product must be fetched anyway.
 */
export interface ICreateSalePayload {
  customer: string;
  products: {
    product: string;
    quantity: number;
  }[];
}

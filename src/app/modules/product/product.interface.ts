import { Document, Model, Types } from 'mongoose';

export interface IProduct {
    _id?: Types.ObjectId;
    name: string;
    sku: string;
    category: string;
    images: string[];
    purchasePrice: number;
    sellingPrice: number;
    stockQuantity: number;
    isDeleted: boolean;
    deletedImageUrls?: string[];
    createdAt?: Date;
    updatedAt?: Date;
}

export type IProductCreate = Pick<
    IProduct,
    'name' | 'sku' | 'category' | 'purchasePrice' | 'sellingPrice' | 'stockQuantity' | 'images' | 'deletedImageUrls'
>;

export type IProductUpdate = Partial<IProductCreate>;

export interface IProductDocument extends IProduct, Document {
    _id: Types.ObjectId;
}

export interface IProductModel extends Model<IProductDocument> {
    isSkuTaken(sku: string, excludeProductId?: Types.ObjectId): Promise<boolean>;
}
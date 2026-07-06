import { Document, Model, Types } from 'mongoose';

export interface ICustomer {
  _id?: Types.ObjectId;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  isDeleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export type ICustomerCreate = Pick<
  ICustomer,
  'name' | 'phone' | 'email' | 'address'
>;

export type ICustomerUpdate = Partial<ICustomerCreate>;

export interface ICustomerDocument extends ICustomer, Document {
  _id: Types.ObjectId;
}

export interface ICustomerModel extends Model<ICustomerDocument> {
  isPhoneTaken(
    phone: string,
    excludeCustomerId?: Types.ObjectId,
  ): Promise<boolean>;
}

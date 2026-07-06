import { Schema, model } from 'mongoose';
import { ICustomerDocument, ICustomerModel } from './customer.interface';

const customerSchema = new Schema<ICustomerDocument, ICustomerModel>(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, unique: true, trim: true },
    email: { type: String, lowercase: true, trim: true },
    address: { type: String, trim: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true, versionKey: false },
);

customerSchema.statics.isPhoneTaken = async function (
  phone: string,
  excludeCustomerId?: string,
): Promise<boolean> {
  const query: Record<string, unknown> = { phone: phone.trim() };
  if (excludeCustomerId) {
    query._id = { $ne: excludeCustomerId };
  }
  const customer = await this.findOne(query).select('_id');
  return !!customer;
};

export const Customer = model<ICustomerDocument, ICustomerModel>('Customer', customerSchema);
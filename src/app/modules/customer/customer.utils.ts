import { ClientSession } from 'mongoose';
import { ICustomerDocument } from './customer.interface';
import { Customer } from './customer.models';
import { HTTP_STATUS_CODE } from '../../utils/HTTP_STATUS_CODE';
import AppError from '../../errorHelpers/AppError';

export const assertCustomerExists = async (
  customerId: string,
  session?: ClientSession,
): Promise<ICustomerDocument> => {
  const customer = await Customer.findOne({ _id: customerId, isDeleted: false }).session(
    session ?? null,
  );

  if (!customer) {
    throw new AppError(HTTP_STATUS_CODE.NOT_FOUND, 'Customer not found');
  }

  return customer;
};
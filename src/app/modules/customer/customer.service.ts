import { ICustomerCreate, ICustomerUpdate } from './customer.interface';
import { CUSTOMER_SEARCHABLE_FIELDS } from './customer.constants';
import { Customer } from './customer.models';
import { HTTP_STATUS_CODE } from '../../utils/HTTP_STATUS_CODE';
import AppError from '../../errorHelpers/AppError';
import { QueryBuilder } from '../../builder/QueryBuilder';

const createCustomer = async (payload: ICustomerCreate) => {
  const phoneTaken = await Customer.isPhoneTaken(payload.phone);

  if (phoneTaken) {
    throw new AppError(
      HTTP_STATUS_CODE.CONFLICT,
      'A customer with this phone number already exists',
    );
  }

  const customer = await Customer.create(payload);
  return customer;
};

const getAllCustomers = async (query: Record<string, string>) => {
  const queryBuilder = new QueryBuilder(
    Customer.find({ isDeleted: false }),
    query,
  );

  const customersQuery = queryBuilder
    .search(CUSTOMER_SEARCHABLE_FIELDS)
    .filter()
    .sort()
    .fields()
    .paginate();

  const [result, meta] = await Promise.all([
    customersQuery.build().lean(),
    queryBuilder.getMeta(),
  ]);

  return { result, meta };
};

const getSingleCustomer = async (id: string) => {
  const customer = await Customer.findOne({ _id: id, isDeleted: false }).lean();

  if (!customer) {
    throw new AppError(HTTP_STATUS_CODE.NOT_FOUND, 'Customer not found');
  }

  return customer;
};

const updateCustomer = async (id: string, payload: ICustomerUpdate) => {
  const customer = await Customer.findOne({ _id: id, isDeleted: false });

  if (!customer) {
    throw new AppError(HTTP_STATUS_CODE.NOT_FOUND, 'Customer not found');
  }

  if (payload.phone) {
    const phoneTaken = await Customer.isPhoneTaken(payload.phone, customer._id);
    if (phoneTaken) {
      throw new AppError(
        HTTP_STATUS_CODE.CONFLICT,
        'A customer with this phone number already exists',
      );
    }
  }

  Object.assign(customer, payload);
  await customer.save();

  return customer;
};

const deleteCustomer = async (id: string) => {
  const customer = await Customer.findOne({ _id: id, isDeleted: false });

  if (!customer) {
    throw new AppError(HTTP_STATUS_CODE.NOT_FOUND, 'Customer not found');
  }

  customer.isDeleted = true;
  await customer.save();

  return null;
};

export const customerService = {
  createCustomer,
  getAllCustomers,
  getSingleCustomer,
  updateCustomer,
  deleteCustomer,
};


import catchAsync from '../../utils/catchAsync';
import { HTTP_STATUS_CODE } from '../../utils/HTTP_STATUS_CODE';
import { sendResponse } from '../../utils/sendResponse';
import { customerService } from './customer.service';

const createCustomer = catchAsync(async (req, res) => {
  const result = await customerService.createCustomer(req.body);

  sendResponse(res, {
    statusCode: HTTP_STATUS_CODE.CREATED,
    success: true,
    message: 'Customer created successfully',
    data: result,
  });
});

const getAllCustomers = catchAsync(async (req, res) => {
  const { result, meta } = await customerService.getAllCustomers(
    req.query as Record<string, string>,
  );

  sendResponse(res, {
    statusCode: HTTP_STATUS_CODE.OK,
    success: true,
    message: 'Customers retrieved successfully',
    data: { meta, result },
  });
});

const getSingleCustomer = catchAsync(async (req, res) => {
  const result = await customerService.getSingleCustomer(req.params.id as string);

  sendResponse(res, {
    statusCode: HTTP_STATUS_CODE.OK,
    success: true,
    message: 'Customer retrieved successfully',
    data: result,
  });
});

const updateCustomer = catchAsync(async (req, res) => {
  const result = await customerService.updateCustomer(req.params.id as string, req.body);

  sendResponse(res, {
    statusCode: HTTP_STATUS_CODE.OK,
    success: true,
    message: 'Customer updated successfully',
    data: result,
  });
});

const deleteCustomer = catchAsync(async (req, res) => {
  await customerService.deleteCustomer(req.params.id as string);

  sendResponse(res, {
    statusCode: HTTP_STATUS_CODE.OK,
    success: true,
    message: 'Customer deleted successfully',
    data: null,
  });
});

export const customerController = {
  createCustomer,
  getAllCustomers,
  getSingleCustomer,
  updateCustomer,
  deleteCustomer,
};
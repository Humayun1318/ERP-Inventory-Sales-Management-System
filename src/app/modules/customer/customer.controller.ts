import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import { customerService } from './customer.service';

const createCustomer = catchAsync(async (req: Request, res: Response) => {});
const getAllCustomer = catchAsync(async (req: Request, res: Response) => {});
const getCustomerById = catchAsync(async (req: Request, res: Response) => {});
const updateCustomer = catchAsync(async (req: Request, res: Response) => {});
const deleteCustomer = catchAsync(async (req: Request, res: Response) => {});

export const customerController = {
  createCustomer,
  getAllCustomer,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
};
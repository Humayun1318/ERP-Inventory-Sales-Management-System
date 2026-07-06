import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import { saleService } from './sale.service';

const createSale = catchAsync(async (req: Request, res: Response) => {});
const getAllSale = catchAsync(async (req: Request, res: Response) => {});
const getSaleById = catchAsync(async (req: Request, res: Response) => {});
const updateSale = catchAsync(async (req: Request, res: Response) => {});
const deleteSale = catchAsync(async (req: Request, res: Response) => {});

export const saleController = {
  createSale,
  getAllSale,
  getSaleById,
  updateSale,
  deleteSale,
};
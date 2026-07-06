
import { sendResponse } from '../../utils/sendResponse';
import { getUserIdFromReq } from '../../utils/getUserIdFromReq';
import { saleService } from './sale.service';
import catchAsync from '../../utils/catchAsync';
import { HTTP_STATUS_CODE } from '../../utils/HTTP_STATUS_CODE';

const createSale = catchAsync(async (req, res) => {
  const createdBy = getUserIdFromReq(req);
  const result = await saleService.createSale(req.body, createdBy);

  sendResponse(res, {
    statusCode: HTTP_STATUS_CODE.CREATED,
    success: true,
    message: 'Sale created successfully',
    data: result,
  });
});

const getAllSales = catchAsync(async (req, res) => {
  const { result, meta } = await saleService.getAllSales(req.query as Record<string, string>);

  sendResponse(res, {
    statusCode: HTTP_STATUS_CODE.OK,
    success: true,
    message: 'Sales retrieved successfully',
    data: { meta, result },
  });
});

const getSingleSale = catchAsync(async (req, res) => {
  const result = await saleService.getSingleSale(req.params.id as string);

  sendResponse(res, {
    statusCode: HTTP_STATUS_CODE.OK,
    success: true,
    message: 'Sale retrieved successfully',
    data: result,
  });
});

export const saleController = {
  createSale,
  getAllSales,
  getSingleSale,
};
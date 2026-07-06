
import catchAsync from '../../utils/catchAsync';
import { HTTP_STATUS_CODE } from '../../utils/HTTP_STATUS_CODE';
import { sendResponse } from '../../utils/sendResponse';
import { productService } from './product.service';

const createProduct = catchAsync(async (req, res) => {

  const payload = {
    ...req.body,
    images: req.files ? (req.files as Express.Multer.File[]).map((file) => file.path) : [],
  }
  const result = await productService.createProduct(payload);

  sendResponse(res, {
    statusCode: HTTP_STATUS_CODE.CREATED,
    success: true,
    message: 'Product created successfully',
    data: result,
  });
});

const getAllProducts = catchAsync(async (req, res) => {
  const { result, meta } = await productService.getAllProducts(
    req.query as Record<string, string>,
  );

  sendResponse(res, {
    statusCode: HTTP_STATUS_CODE.OK,
    success: true,
    message: 'Products retrieved successfully',
    data: { meta, result },
  });
});

const getSingleProduct = catchAsync(async (req, res) => {
  const result = await productService.getSingleProduct(req.params.id as string);

  sendResponse(res, {
    statusCode: HTTP_STATUS_CODE.OK,
    success: true,
    message: 'Product retrieved successfully',
    data: result,
  });
});

const updateProduct = catchAsync(async (req, res) => {
  const payload = {
    ...req.body,
    images: req.files ? (req.files as Express.Multer.File[]).map((file) => file.path) : [],
    deletedImageUrls: req.body.deletedImageUrls ? Array.isArray(req.body.deletedImageUrls) ? req.body.deletedImageUrls : [req.body.deletedImageUrls] : [],
  };
  const result = await productService.updateProduct(req.params.id as string, payload);

  sendResponse(res, {
    statusCode: HTTP_STATUS_CODE.OK,
    success: true,
    message: 'Product updated successfully',
    data: result,
  });
});

const deleteProduct = catchAsync(async (req, res) => {
  await productService.deleteProduct(req.params.id as string);

  sendResponse(res, {
    statusCode: HTTP_STATUS_CODE.OK,
    success: true,
    message: 'Product deleted successfully',
    data: null,
  });
});

export const productController = {
  createProduct,
  getAllProducts,
  getSingleProduct,
  updateProduct,
  deleteProduct,
};
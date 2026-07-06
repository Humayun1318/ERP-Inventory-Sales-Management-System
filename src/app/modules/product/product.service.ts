
import { IProductCreate, IProductUpdate } from './product.interface';
import { PRODUCT_SEARCHABLE_FIELDS } from './product.constants';
import { Product } from './product.models';
import { HTTP_STATUS_CODE } from '../../utils/HTTP_STATUS_CODE';
import { QueryBuilder } from '../../builder/QueryBuilder';
import AppError from '../../errorHelpers/AppError';

const createProduct = async (payload: IProductCreate) => {
  const skuTaken = await Product.isSkuTaken(payload.sku);

  if (skuTaken) {
    throw new AppError(HTTP_STATUS_CODE.CONFLICT, 'A product with this SKU already exists');
  }

  const product = await Product.create(payload);
  return product;
};

const getAllProducts = async (query: Record<string, string>) => {

  const queryBuilder = new QueryBuilder(Product.find({ isDeleted: false }), query);

  const productsQuery = queryBuilder
    .search(PRODUCT_SEARCHABLE_FIELDS)
    .filter()
    .rangeFilter([
      {
        field: 'sellingPrice',
        min: 'minSellingPrice',
        max: 'maxSellingPrice',
      },
      {
        field: 'purchasePrice',
        min: 'minPurchasePrice',
        max: 'maxPurchasePrice',
      },
      {
        field: 'stockQuantity',
        min: 'minStock',
        max: 'maxStock',
      },
    ])
    .sort()
    .fields()
    .paginate();

  const [result, meta] = await Promise.all([
    productsQuery.build().lean(),
    queryBuilder.getMeta(),
  ]);

  return { result, meta };
};

const getSingleProduct = async (id: string) => {
  const product = await Product.findOne({ _id: id, isDeleted: false }).lean();

  if (!product) {
    throw new AppError(HTTP_STATUS_CODE.NOT_FOUND, 'Product not found');
  }

  return product;
};

const updateProduct = async (id: string, payload: IProductUpdate) => {
  const product = await Product.findOne({ _id: id, isDeleted: false });

  if (!product) {
    throw new AppError(HTTP_STATUS_CODE.NOT_FOUND, 'Product not found');
  }

  if (payload.sku) {
    const skuTaken = await Product.isSkuTaken(payload.sku, product._id);
    if (skuTaken) {
      throw new AppError(HTTP_STATUS_CODE.CONFLICT, 'A product with this SKU already exists');
    }
  }

  Object.assign(product, payload);
  await product.save();

  return product;
};

const deleteProduct = async (id: string) => {
  const product = await Product.findOne({ _id: id, isDeleted: false });

  if (!product) {
    throw new AppError(HTTP_STATUS_CODE.NOT_FOUND, 'Product not found');
  }

  product.isDeleted = true;
  await product.save();

  return null;
};

export const productService = {
  createProduct,
  getAllProducts,
  getSingleProduct,
  updateProduct,
  deleteProduct,
};
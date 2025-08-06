import httpStatus from 'http-status';
import QueryBuilder from '../../builder/QueryBuilder';
import { Product } from '../product/product.model';
import { PickedProduct } from '../pickupMan/pickupMan.model';
import { Warehouse } from '../warehouse/warehouse.model';
import AppError from '../../errors/AppError';
import { Types } from 'mongoose';

// get all product stock
const getAllProductStockFromDB = async (
    warehouseID: string,
    query: Record<string, unknown>
) => {
    const warehouse = await Warehouse.findOne({ id: warehouseID }).select(
        '_id'
    );
    if (!warehouse) {
        throw new AppError(httpStatus.NOT_FOUND, 'No warehouse found');
    }
    const fetchQuery = new QueryBuilder(Product.find().limit(200), query)
        .filter()
        .sort()
        .paginate()
        .fields();

    const products = await fetchQuery.modelQuery;

    const stocks = await Promise.all(
        products.map(async product => {
            const latestStock = await PickedProduct.find({
                warehouse: warehouse._id,
                product: product._id,
            })
                .sort('-insertedDate')
                .limit(2);

            if (latestStock && latestStock.length > 0) {
                return {
                    product: product.toObject(),
                    stock: latestStock,
                };
            }

            return null;
        })
    );

    /* 
    stockValue = ((stock[1].price / product.quantityperbox) * stock[0].previousquantity) + ((stock[0].price / product.quantityperbox) * stock[0].newquantity)
    */

    const result = stocks.filter(item => item !== null);
    console.log({ result, stocks });
    return result;
};

// get product stock history
const getProductStockHistoryFromDB = async (
    warehouseID: string,
    productID: string,
    query: Record<string, unknown>
) => {
    const warehouse = await Warehouse.findOne({ id: warehouseID }).select(
        '_id'
    );
    if (!warehouse) {
        throw new AppError(httpStatus.NOT_FOUND, 'No warehouse found');
    }
    const product = await Product.findOne({ id: productID }).select('_id');
    if (!product) {
        throw new AppError(httpStatus.NOT_FOUND, 'No product found');
    }
    const fetchQuery = new QueryBuilder(
        PickedProduct.find({
            warehouse: warehouse._id,
            product: product._id,
        }).populate('product'),
        query
    )
        .filter()
        .sort()
        .paginate()
        .fields();

    const result = await fetchQuery.modelQuery;
    const meta = await fetchQuery.countTotal();
    return { result, meta };
};

const updateProductStockIntoDB = async (
    id: string,
    payload: { quantity: number }
) => {
    const result = await PickedProduct.findByIdAndUpdate(
        new Types.ObjectId(id),
        payload,
        { new: true }
    );
    return result;
};

export const StockServices = {
    getAllProductStockFromDB,
    getProductStockHistoryFromDB,
    updateProductStockIntoDB,
};

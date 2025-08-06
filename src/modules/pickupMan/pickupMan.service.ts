import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { IPickedProduct } from './pickupMan.interface';
import { Product } from '../product/product.model';
import { Packingman, PickedProduct, Pickupman } from './pickupMan.model';
import QueryBuilder from '../../builder/QueryBuilder';
import moment from 'moment-timezone';
import { TIMEZONE } from '../../constant';
import { User } from '../user/user.model';
import { JwtPayload } from 'jsonwebtoken';
import { Warehouse } from '../warehouse/warehouse.model';
import { Types } from 'mongoose';

// create picked product
const createPickedProductIntoDB = async (
    payload: IPickedProduct,
    userPayload: JwtPayload
) => {
    const dealer = await User.findOne({ id: payload?.dealer });
    if (!dealer) {
        throw new AppError(httpStatus.NOT_FOUND, 'No dealer found');
    }

    const warehouse = await Warehouse.findOne({ id: payload?.warehouse });
    if (!warehouse) {
        throw new AppError(httpStatus.NOT_FOUND, 'No warehouse found');
    }

    const product = await Product.findOne({ id: payload?.product });
    if (!product) {
        throw new AppError(httpStatus.NOT_FOUND, 'No product found');
    }

    const pickupman = await User.findOne({ id: userPayload?.userId });
    if (!pickupman) {
        throw new AppError(httpStatus.NOT_FOUND, 'No pickupman found');
    }

    const pickedProductData: IPickedProduct = {
        ...payload,
    };
    pickedProductData.dealer = dealer._id;
    pickedProductData.pickupman = pickupman._id;
    pickedProductData.product = product._id;
    pickedProductData.warehouse = warehouse._id;

    const result = await PickedProduct.create(pickedProductData);
    return result;
};

// get all picked product
const getAllPickedProductFromDB = async (query: Record<string, unknown>) => {
    const fetchQuery = new QueryBuilder(
        PickedProduct.find()
            .populate('dealer')
            .populate('warehouse')
            .populate('pickupman')
            .populate('product'),
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

// get single pickupman
const getSinglePickupmanFromDB = async (id: string) => {
    const user = await User.findOne({ id }).select('_id');
    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, 'No user found');
    }
    const result = await Pickupman.findById(user._id)
        .populate('pickupman')
        .populate('warehouse');
    return result;
};

// get single packingman
const getSinglePackingmanFromDB = async (id: string) => {
    const user = await User.findOne({ id }).select('_id');
    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, 'No user found');
    }
    const result = await Packingman.findById(user._id)
        .populate('packingman')
        .populate('warehouse');
    return result;
};

// assign warehouse to pickupman
const assignWarehouseToPickupmanIntoDB = async (
    id: string,
    payload: { warehouse: Types.ObjectId }
) => {
    const user = await User.findOne({ id, status: 'Active', isDeleted: false });
    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, 'No Freelancer Found');
    }

    const result = await Pickupman.findOneAndUpdate(
        { pickupman: user?._id },
        payload,
        { new: true }
    );
    return result;
};

// assign warehouse to packingman
const assignWarehouseToPackingmanIntoDB = async (
    id: string,
    payload: { warehouse: Types.ObjectId }
) => {
    const user = await User.findOne({ id, status: 'Active', isDeleted: false });
    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, 'No Freelancer Found');
    }

    const result = await Packingman.findOneAndUpdate(
        { packingman: user?._id },
        payload,
        { new: true }
    );
    return result;
};

// update picked product
const updatePickedProductIntoDB = async (
    id: string,
    payload: Partial<IPickedProduct>
) => {
    const result = await PickedProduct.findByIdAndUpdate(
        new Types.ObjectId(id),
        payload,
        { new: true }
    );
    return result;
};

export const PickedProductServices = {
    createPickedProductIntoDB,
    getAllPickedProductFromDB,
    getSinglePickupmanFromDB,
    getSinglePackingmanFromDB,
    assignWarehouseToPickupmanIntoDB,
    assignWarehouseToPackingmanIntoDB,
    updatePickedProductIntoDB,
};

import { JwtPayload } from 'jsonwebtoken';
import { IInProduct } from './inproduct.interface';
import { Warehouse } from '../warehouse/warehouse.model';
import AppError from '../../errors/AppError';
import httpStatus from 'http-status';
import { Product } from '../product/product.model';
import { User } from '../user/user.model';
import { InProduct } from './inproduct.model';
import QueryBuilder from '../../builder/QueryBuilder';
import moment from 'moment-timezone';
import { TIMEZONE } from '../../constant';
import mongoose from 'mongoose';
import { PickedProduct } from '../pickupMan/pickupMan.model';

// create in product
const createInProductIntoDB = async (
    payload: IInProduct,
    userPayload: JwtPayload
) => {
    const warehouse = await Warehouse.findOne({ id: payload?.warehouse });
    if (!warehouse) {
        throw new AppError(httpStatus.NOT_FOUND, 'No warehouse found');
    }

    const product = await Product.findOne({ id: payload?.product });
    if (!product) {
        throw new AppError(httpStatus.NOT_FOUND, 'No product found');
    }

    const dsr = await User.findOne({
        id: userPayload?.userId,
        role: 'deliveryMan',
    });
    if (!dsr) {
        throw new AppError(httpStatus.NOT_FOUND, 'No dsr found');
    }

    const prevInProduct = await InProduct.findOne({
        dsr: dsr._id,
        product: product._id,
        createdAt: {
            $gte: moment().tz(TIMEZONE).startOf('day').format(),
            $lte: moment().tz(TIMEZONE).endOf('day').format(),
        },
    });
    if (prevInProduct) {
        throw new AppError(httpStatus.NOT_FOUND, 'Once in this product');
    }

    const inProductData: IInProduct = {
        ...payload,
    };
    inProductData.dsr = dsr._id;
    inProductData.product = product._id;
    inProductData.warehouse = warehouse._id;

    const productStock = await PickedProduct.find({
        warehouse: warehouse._id,
        product: product._id,
    })
        .sort('-insertedDate')
        .limit(1);

    if (productStock.length === 0) {
        throw new AppError(httpStatus.NOT_FOUND, 'No product stock found');
    }

    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        await PickedProduct.findByIdAndUpdate(
            productStock[0]._id,
            { $inc: { quantity: inProductData.quantity } },
            { session, new: true }
        );

        const result = await InProduct.create([inProductData], { session });

        await session.commitTransaction();
        await session.endSession();

        return result[0];
    } catch (err) {
        await session.abortTransaction();
        await session.endSession();
        throw new AppError(
            httpStatus.BAD_REQUEST,
            'Mongoose transaction failed',
            err as string
        );
    }
};

// get all in product
const getAllInProductFromDB = async (query: Record<string, unknown>) => {
    const fetchQuery = new QueryBuilder(
        InProduct.find()
            .populate('dsr')
            .populate('warehouse')
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

// get single in product
const getSingleInProductFromDB = async (dsrId: string, productId: string) => {
    const dsr = await User.findOne({ id: dsrId, role: 'deliverMan' }).select(
        '_id'
    );
    if (!dsr) {
        throw new AppError(httpStatus.NOT_FOUND, 'No dsr found');
    }
    const product = await Product.findOne({ id: productId }).select('_id');
    if (!product) {
        throw new AppError(httpStatus.NOT_FOUND, 'No product found');
    }
    const result = await InProduct.findOne({ dsr, product })
        .populate('dsr')
        .populate('warehouse')
        .populate('product');
    return result;
};

export const InProductServices = {
    createInProductIntoDB,
    getAllInProductFromDB,
    getSingleInProductFromDB,
};

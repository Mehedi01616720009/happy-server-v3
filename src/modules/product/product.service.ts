import httpStatus from 'http-status';
import QueryBuilder from '../../builder/QueryBuilder';
import AppError from '../../errors/AppError';
import generateImageName from '../../utils/generateImageName';
import generateSlug from '../../utils/generateSlug';
import { sendImageToCloudinary } from '../../utils/sendImageToCloudinary';
import { IProduct } from './product.interface';
import { Product } from './product.model';
import { Category } from '../category/category.model';
import { Company } from '../company/company.model';
import moment from 'moment-timezone';
import { TIMEZONE } from '../../constant';
import { Types } from 'mongoose';
import { Order } from '../order/order.model';
import { Packingman, PickedProduct } from '../pickupMan/pickupMan.model';
import { User } from '../user/user.model';
import { JwtPayload } from 'jsonwebtoken';
import { Tag } from '../tag/tag.model';

// create product
const createProductIntoDB = async (
    file: Express.Multer.File,
    payload: IProduct
) => {
    const category = await Category.findById(payload?.category);
    if (!category) {
        throw new AppError(httpStatus.NOT_FOUND, 'No category found');
    }

    const company = await Company.findById(payload?.company);
    if (!company) {
        throw new AppError(httpStatus.NOT_FOUND, 'No company found');
    }

    const dealer = await User.findById(payload?.dealer);
    if (!dealer) {
        throw new AppError(httpStatus.NOT_FOUND, 'No dealer found');
    }

    await Promise.resolve(
        payload.tags &&
            payload.tags?.map(async tag => {
                const tagData = await Tag.findById(tag);
                if (!tagData) {
                    throw new AppError(httpStatus.NOT_FOUND, 'No tag found');
                }
            })
    ).catch(err => {
        throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, err?.message);
    });

    const productData: IProduct = {
        ...payload,
    };
    productData.category = category._id;
    productData.company = company._id;
    productData.dealer = dealer._id;
    productData.id = await generateSlug(payload.name);

    if (file?.path) {
        // generate image name
        const imageName = generateImageName(productData.id);

        // wait for cloudinary response
        const image = await sendImageToCloudinary(imageName, file?.path);
        productData.image = image?.secure_url;
    }

    const result = await Product.create(productData);
    return result;
};

// get all product
const getAllProductFromDB = async (query: Record<string, unknown>) => {
    const fetchQuery = new QueryBuilder(
        Product.find({ isDeleted: false })
            .populate('category')
            .populate('company')
            .populate('dealer')
            .populate('tags'),
        query
    )
        .search(['name', 'bnName'])
        .filter()
        .sort()
        .paginate()
        .fields();

    const result = await fetchQuery.modelQuery;
    const meta = await fetchQuery.countTotal();
    return { result, meta };
};

// get top selling product
const getTopSellingProductFromDB = async (query: Record<string, unknown>) => {
    const last7Days = moment().subtract(7, 'days').startOf('day').format();

    const matchDealer = query.dealer
        ? { 'orderInfo.dealer': new Types.ObjectId(query.dealer as string) }
        : {};
    const orders = await Order.find({
        dealer: query.dealer,
        createdAt: {
            $gte: last7Days,
        },
    }).select('_id');
    const orderIDs = orders.map(item => item._id);

    const topSellingProducts = await Order.aggregate([
        { $match: { order: { $in: orderIDs } } },
        { $unwind: '$products' },
        {
            $match: {
                'products.isCancelled.isCancelled': { $ne: true },
            },
        },
        {
            $group: {
                _id: '$products.product',
                totalQuantitySold: { $sum: '$products.quantity' },
            },
        },
        {
            $sort: { totalQuantitySold: -1 },
        },
        {
            $limit: 25,
        },
        {
            $lookup: {
                from: 'products',
                localField: '_id',
                foreignField: '_id',
                as: 'product',
            },
        },
        {
            $unwind: '$product',
        },
        {
            $lookup: {
                from: 'users',
                localField: 'product.dealer',
                foreignField: '_id',
                as: 'dealer',
            },
        },
        {
            $unwind: '$dealer',
        },
        {
            $project: {
                _id: '$product._id',
                id: '$product.id',
                bnName: '$product.bnName',
                price: '$product.price',
                dealer: {
                    _id: '$dealer._id',
                    id: '$dealer.id',
                    name: '$dealer.name',
                    phone: '$dealer.phone',
                },
                dealerCommission: '$product.dealerCommission',
                packageType: '$product.packageType',
                quantityPerPackage: '$product.quantityPerPackage',
                image: '$product.image',
                totalQuantitySold: 1,
            },
        },
    ]);

    return {
        result: topSellingProducts,
        meta: { limit: 10, page: 1, totalPage: 1, totalDoc: 10 },
    };
};

// get all product with stock
const getAllProductWithStockFromDB = async (query: Record<string, unknown>) => {
    const { warehouse, ...restQuery } = query;
    const fetchQuery = new QueryBuilder(
        Product.find({ isDeleted: false })
            .populate('category')
            .populate('company')
            .populate('dealer')
            .populate('tags'),
        restQuery
    )
        .search(['name', 'bnName'])
        .filter()
        .sort()
        .paginate()
        .fields();

    const products = await fetchQuery.modelQuery;
    const meta = await fetchQuery.countTotal();

    const result = await Promise.all(
        products.map(async product => {
            const stockData = await PickedProduct.find({
                product: product._id,
                warehouse,
            })
                .sort('-insertedDate')
                .limit(1)
                .populate('warehouse');

            if (stockData.length === 0) {
                return {
                    ...product.toObject(),
                    stockData: {
                        quantity: 0,
                    },
                };
            }

            return {
                ...product.toObject(),
                stockData: {
                    quantity: stockData[0].quantity,
                },
            };
        })
    );

    return { result, meta };
};

// get products group by sr and ordered date
const getProductsGroupedBySRsAndOrderedDateFromDB = async (
    srIds: string | string[],
    userPayload: JwtPayload,
    createdAt?: string
) => {
    const srArray = Array.isArray(srIds)
        ? srIds.map(id => new Types.ObjectId(id))
        : [new Types.ObjectId(srIds)];

    const matchConditions: Record<string, unknown> = {
        sr: { $in: srArray },
    };

    if (createdAt) {
        const startOfDay = moment
            .tz(createdAt, TIMEZONE)
            .startOf('day')
            .format();

        const endOfDay = moment.tz(createdAt, TIMEZONE).endOf('day').format();

        matchConditions.createdAt = { $gte: startOfDay, $lte: endOfDay };
    }

    const pickupman = await User.find({
        id: userPayload.userId,
        role: 'pickupMan',
    });
    if (pickupman) {
        matchConditions.status = 'Processing';
        delete matchConditions.createdAt;
    }

    const orders = await Order.find(matchConditions).select('_id');
    const orderIds = orders.map(order => order._id);

    if (orderIds.length === 0) {
        throw new AppError(httpStatus.NOT_FOUND, 'No Order Found');
    }

    const orderDetailsAggregation = await Order.aggregate([
        {
            $match: {
                order: { $in: orderIds },
            },
        },
        {
            $unwind: '$products',
        },
        {
            $lookup: {
                from: 'products',
                localField: 'products.product',
                foreignField: '_id',
                as: 'productDetails',
            },
        },
        {
            $unwind: '$productDetails',
        },
        {
            $group: {
                _id: '$products.product',
                totalQuantity: { $sum: '$products.quantity' },
                productID: { $first: '$productDetails._id' },
                productName: { $first: '$productDetails.name' },
                productImg: { $first: '$productDetails.image' },
                quantityPerPackage: {
                    $first: '$productDetails.quantityPerPackage',
                },
            },
        },
        {
            $project: {
                _id: 0,
                productID: 1,
                productName: 1,
                productImg: 1,
                totalQuantity: 1,
                quantityPerPackage: 1,
            },
        },
    ]);

    if (pickupman) {
        const pickedProductsFilter: Record<string, unknown> = {};
        if (createdAt) {
            const startOfDay = moment
                .tz(createdAt, TIMEZONE)
                .startOf('day')
                .format();

            const endOfDay = moment
                .tz(createdAt, TIMEZONE)
                .endOf('day')
                .format();

            pickedProductsFilter.createdAt = {
                $gte: startOfDay,
                $lte: endOfDay,
            };
        }

        const pickedProducts = await PickedProduct.find(
            pickedProductsFilter
        ).select('product');

        const pickedProductIds = pickedProducts.map(pickedProduct =>
            pickedProduct.product.toString()
        );

        const orderDetailsAggregationIds = orderDetailsAggregation.map(item =>
            item.productID.toString()
        );

        const filteredOrderDetailsIds = orderDetailsAggregationIds.filter(
            item => !pickedProductIds.includes(item)
        );

        const filteredOrderDetails = orderDetailsAggregation.filter(
            orderDetails =>
                filteredOrderDetailsIds.includes(
                    orderDetails.productID.toString()
                )
        );

        return {
            result: filteredOrderDetails,
            meta: {
                totalDoc: filteredOrderDetails.length,
            },
        };
    }

    return {
        result: orderDetailsAggregation,
        meta: {
            totalDoc: orderDetailsAggregation.length,
        },
    };
};

const getProductsGroupedBySRsAndStatusDispatchedFromDB = async (
    query: Record<string, unknown>,
    userPayload: JwtPayload
) => {
    const sr = query?.sr;
    const createdAt = query?.createdAt;
    const packedAt = query?.packedAt;
    const matchStages: Record<string, unknown> = { status: 'Processing' };
    let startDay = moment().tz(TIMEZONE).startOf('day').format();
    let endDay = moment().tz(TIMEZONE).endOf('day').format();

    if (packedAt) {
        startDay = moment.tz(packedAt, TIMEZONE).startOf('day').format();
        endDay = moment.tz(packedAt, TIMEZONE).endOf('day').format();
    }
    if (sr) {
        matchStages.sr = {
            $in: (sr as string[]).map(
                (item: string) => new Types.ObjectId(item)
            ),
        };
    }
    if (createdAt) {
        matchStages.createdAt = {
            $gte: moment
                .tz((createdAt as { gte: string; lte: string }).gte, TIMEZONE)
                .startOf('day')
                .format(),
            $lte: moment
                .tz((createdAt as { gte: string; lte: string }).lte, TIMEZONE)
                .endOf('day')
                .format(),
        };
    }

    const packingManUser = await User.findOne({ id: userPayload.userId });
    if (!packingManUser) {
        throw new AppError(httpStatus.NOT_FOUND, 'No user found');
    }
    const packingMan = await Packingman.findOne({
        packingman: packingManUser._id,
    }).select('warehouse packingman');
    if (!packingMan) {
        throw new AppError(httpStatus.NOT_FOUND, 'No packingMan found');
    }
    if (!packingMan.warehouse) {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            'Packingman has no warehouse assigned'
        );
    }

    const warehouseId = packingMan.warehouse;

    const summary = await Order.aggregate([
        { $match: matchStages },
        { $unwind: '$products' },
        {
            $group: {
                _id: '$products.product',
                orderedQuantity: {
                    $sum: { $ifNull: ['$products.summary.orderedQuantity', 0] },
                },
            },
        },
        {
            $lookup: {
                from: 'products',
                localField: '_id',
                foreignField: '_id',
                as: 'product',
            },
        },
        { $unwind: '$product' },
        {
            $lookup: {
                from: 'pickedproducts',
                let: { productId: '$_id' },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ['$product', '$$productId'] },
                                    { $eq: ['$warehouse', warehouseId] },
                                ],
                            },
                        },
                    },
                    { $sort: { createdAt: -1 } },
                    { $limit: 1 },
                ],
                as: 'pickedStock',
            },
        },
        {
            $lookup: {
                from: 'inventories',
                let: { productId: '$_id' },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ['$product', '$$productId'] },
                                    { $eq: ['$warehouse', warehouseId] },
                                    {
                                        $eq: [
                                            '$packingman',
                                            packingMan.packingman,
                                        ],
                                    },
                                    { $gte: ['$createdAt', startDay] },
                                    { $lte: ['$createdAt', endDay] },
                                ],
                            },
                        },
                    },
                    {
                        $group: {
                            _id: null,
                            totalPacked: { $sum: '$outQuantity' },
                        },
                    },
                ],
                as: 'inventoryPacked',
            },
        },
        {
            $addFields: {
                stock: {
                    $ifNull: [
                        { $arrayElemAt: ['$pickedStock.quantity', 0] },
                        0,
                    ],
                },
                packedQuantity: {
                    $ifNull: [
                        { $arrayElemAt: ['$inventoryPacked.totalPacked', 0] },
                        0,
                    ],
                },
            },
        },
        {
            $project: {
                _id: 1,
                id: '$product.id',
                name: '$product.name',
                bnName: '$product.bnName',
                packageType: '$product.packageType',
                quantityPerPackage: '$product.quantityPerPackage',
                image: '$product.image',
                orderedQuantity: 1,
                packedQuantity: 1,
                stock: 1,
            },
        },
    ]);

    return summary;
};

// get single product
const getSingleProductFromDB = async (id: string) => {
    const result = Product.findOne({ id, isDeleted: false })
        .populate('category')
        .populate('company')
        .populate('dealer');
    if (!result) {
        throw new AppError(httpStatus.NOT_FOUND, 'No Product Found');
    }
    return result;
};

// update product
const updateProductIntoDB = async (id: string, payload: IProduct) => {
    const product = await Product.findOne({ id, isDeleted: false });
    if (!product) {
        throw new AppError(httpStatus.NOT_FOUND, 'No product found');
    }

    if (payload?.category) {
        const category = await Category.findById(payload?.category);
        if (!category) {
            throw new AppError(httpStatus.NOT_FOUND, 'No category found');
        }
    }

    if (payload?.company) {
        const company = await Company.findById(payload?.company);
        if (!company) {
            throw new AppError(httpStatus.NOT_FOUND, 'No company found');
        }
    }

    if (payload?.dealer) {
        const dealer = await User.findById(payload?.dealer);
        if (!dealer) {
            throw new AppError(httpStatus.NOT_FOUND, 'No dealer found');
        }
    }

    if (payload?.tags) {
        await Promise.resolve(
            payload.tags &&
                payload.tags?.map(async tag => {
                    const tagData = await Tag.findById(tag);
                    if (!tagData) {
                        throw new AppError(
                            httpStatus.NOT_FOUND,
                            'No tag found'
                        );
                    }
                })
        ).catch(err => {
            throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, err?.message);
        });
    }

    const productData = {
        ...payload,
        updatedAt: moment().tz(TIMEZONE).format(),
    };

    const result = await Product.findOneAndUpdate({ id }, productData, {
        new: true,
    });
    return result;
};

// update product image
const updateProductImageIntoDB = async (
    id: string,
    file: Express.Multer.File
) => {
    const product = await Product.findOne({ id, isDeleted: false });
    if (!product) {
        throw new AppError(httpStatus.NOT_FOUND, 'No product found');
    }

    const productData: { image?: string; updatedAt?: string } = {
        updatedAt: moment().tz(TIMEZONE).format(),
    };

    if (file?.path) {
        // generate image name
        const imageName = generateImageName(product.id);

        // wait for cloudinary response
        const image = await sendImageToCloudinary(imageName, file?.path);
        productData.image = image?.secure_url;
    }

    const result = await Product.findOneAndUpdate({ id }, productData, {
        new: true,
    });
    return result;
};

// delete product
const deleteProductIntoDB = async (id: string) => {
    const product = await Product.findOne({ id, isDeleted: false });
    if (!product) {
        throw new AppError(httpStatus.NOT_FOUND, 'No product found');
    }

    const result = await Product.findOneAndUpdate(
        { id },
        {
            isDeleted: true,
            updatedAt: moment().tz(TIMEZONE).format(),
        },
        { new: true }
    );
    return result;
};

export const ProductServices = {
    createProductIntoDB,
    getAllProductFromDB,
    getTopSellingProductFromDB,
    getAllProductWithStockFromDB,
    getProductsGroupedBySRsAndOrderedDateFromDB,
    getProductsGroupedBySRsAndStatusDispatchedFromDB,
    getSingleProductFromDB,
    updateProductIntoDB,
    updateProductImageIntoDB,
    deleteProductIntoDB,
};

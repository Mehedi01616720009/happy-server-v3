import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { User } from '../user/user.model';
import {
    ICreateOrder,
    IOrder,
    IOrderDetailsProduct,
    IOrderSummary,
} from './order.interface';
import generateOrderId from '../../utils/generateOrderId';
import mongoose, { Types } from 'mongoose';
import { Order } from './order.model';
import { Product } from '../product/product.model';
import QueryBuilder from '../../builder/QueryBuilder';
import moment from 'moment-timezone';
import { TIMEZONE } from '../../constant';
import { JwtPayload } from 'jsonwebtoken';
import { Retailer } from '../retailer/retailer.model';
import { CustomerCareData } from '../customerCare/customerCare.model';
import { Packingman, PickedProduct } from '../pickupMan/pickupMan.model';
import { Union } from '../union/union.model';
import { Warehouse } from '../warehouse/warehouse.model';
import { stat } from 'fs';
import { Inventory } from '../inventory/inventory.model';

// create order
const createOrderIntoDB = async (payload: ICreateOrder) => {
    const retailer = await User.findOne({ id: payload?.retailer });
    if (!retailer) {
        throw new AppError(httpStatus.NOT_FOUND, 'No Retailer Found');
    }

    const union = await Union.findOne({ id: payload?.area });
    if (!union) {
        throw new AppError(httpStatus.NOT_FOUND, 'No Union Found');
    }

    const dealer = await User.findOne({ id: payload?.dealer });
    if (!dealer) {
        throw new AppError(httpStatus.NOT_FOUND, 'No Dealer Found');
    }

    let sr = null;
    let dsr = null;
    if (payload?.sr) {
        sr = await User.findOne({ id: payload?.sr });
        if (!sr) {
            throw new AppError(httpStatus.NOT_FOUND, 'No SR Found');
        }
    }

    if (payload?.dsr) {
        dsr = await User.findOne({ id: payload?.dsr });
        if (!dsr) {
            throw new AppError(httpStatus.NOT_FOUND, 'No DSR Found');
        }
    }

    const orderData: Partial<IOrder> = {
        retailer: retailer?._id,
        area: union?._id,
        dealer: dealer?._id,
        sr: sr?._id,
        dsr: dsr?._id,
        status: payload?.status || 'Processing',
        paymentStatus: payload?.paymentStatus || 'Unpaid',
        collectionAmount: Math.ceil(payload?.collectionAmount),
    };

    if (!orderData?.sr) {
        delete orderData?.sr;
    }
    if (!orderData?.dsr) {
        delete orderData?.dsr;
    }
    if (orderData?.dsr) {
        if (orderData.status === 'Baki') {
            orderData.collectedAmount = Math.ceil(
                Number(payload?.collectedAmount)
            );
        } else {
            orderData.collectedAmount = Math.ceil(payload?.collectionAmount);
        }
    }

    orderData.id = await generateOrderId([
        String(payload?.retailer),
        String(dealer.id),
        String(payload?.sr || payload?.dsr),
    ]);

    const orderDetailsData: IOrderDetailsProduct[] = await Promise.all(
        payload?.products.map(async product => {
            const singleProduct = await Product.findOne({
                id: product.product,
            });
            if (!singleProduct) {
                throw new AppError(httpStatus.NOT_FOUND, 'No Product Found');
            }

            const orderDetails: IOrderDetailsProduct = {
                product: singleProduct?._id,
                quantity: product.quantity,
                price: Number(product.price.toFixed(2)),
                totalAmount: Number(product.totalAmount.toFixed(2)),
                dealerPrice: Number(
                    (
                        Number(product.price.toFixed(2)) +
                        Number(
                            (
                                (singleProduct?.dealerCommission *
                                    product.price) /
                                100
                            ).toFixed(2)
                        )
                    ).toFixed(2)
                ),
                dealerTotalAmount: Number(
                    (
                        Number(product.totalAmount.toFixed(2)) +
                        Number(
                            (
                                (singleProduct?.dealerCommission *
                                    product.totalAmount) /
                                100
                            ).toFixed(2)
                        )
                    ).toFixed(2)
                ),
                srPrice: Number(product?.srPrice?.toFixed(2)),
                srTotalAmount: Number(product?.srTotalAmount?.toFixed(2)),
            };

            if (orderData?.sr) {
                orderDetails.summary = {
                    orderedQuantity: product.quantity,
                    soldQuantity: 0,
                };
            }
            if (orderData?.dsr) {
                orderDetails.summary = {
                    orderedQuantity: product.quantity,
                    soldQuantity: product.quantity,
                };
            }

            return orderDetails;
        })
    );

    orderData.products = orderDetailsData;

    const result = await Order.create(orderData);
    return result;
};

// create ready order
const createReadyOrderIntoDB = async (
    payload: ICreateOrder & { warehouse: string }
) => {
    const retailer = await User.findOne({ id: payload?.retailer });
    if (!retailer) {
        throw new AppError(httpStatus.NOT_FOUND, 'No Retailer Found');
    }

    const union = await Union.findOne({ id: payload?.area });
    if (!union) {
        throw new AppError(httpStatus.NOT_FOUND, 'No Union Found');
    }

    const dealer = await User.findOne({ id: payload?.dealer });
    if (!dealer) {
        throw new AppError(httpStatus.NOT_FOUND, 'No Dealer Found');
    }

    const warehouse = await Warehouse.findOne({ id: payload?.warehouse });
    if (!warehouse) {
        throw new AppError(httpStatus.NOT_FOUND, 'No warehouse Found');
    }

    let sr = null;
    let dsr = null;
    if (payload?.sr) {
        sr = await User.findOne({ id: payload?.sr });
        if (!sr) {
            throw new AppError(httpStatus.NOT_FOUND, 'No SR Found');
        }
    }

    if (payload?.dsr) {
        dsr = await User.findOne({ id: payload?.dsr });
        if (!dsr) {
            throw new AppError(httpStatus.NOT_FOUND, 'No DSR Found');
        }
    }

    const orderData: Partial<IOrder> = {
        retailer: retailer?._id,
        area: union?._id,
        dealer: dealer?._id,
        sr: sr?._id,
        dsr: dsr?._id,
        status: payload?.status || 'Processing',
        paymentStatus: payload?.paymentStatus || 'Unpaid',
        collectionAmount: Math.ceil(payload?.collectionAmount),
    };

    if (!orderData?.sr) {
        delete orderData?.sr;
    }
    if (!orderData?.dsr) {
        delete orderData?.dsr;
    }
    if (orderData?.dsr) {
        if (orderData.status === 'Baki') {
            orderData.collectedAmount = Math.ceil(
                Number(payload?.collectedAmount)
            );
        } else {
            orderData.collectedAmount = Math.ceil(payload?.collectionAmount);
        }
    }

    orderData.id = await generateOrderId([
        String(payload?.retailer),
        String(dealer.id),
        'admin-ready-sell',
    ]);

    const orderDetailsData: IOrderDetailsProduct[] = await Promise.all(
        payload?.products.map(async product => {
            const singleProduct = await Product.findOne({
                id: product.product,
            });
            if (!singleProduct) {
                throw new AppError(httpStatus.NOT_FOUND, 'No Product Found');
            }

            const orderDetails: IOrderDetailsProduct = {
                product: singleProduct?._id,
                quantity: product.quantity,
                price: Number(product.price.toFixed(2)),
                totalAmount: Number(product.totalAmount.toFixed(2)),
                dealerPrice: Number(
                    (
                        Number(product.price.toFixed(2)) +
                        Number(
                            (
                                (singleProduct?.dealerCommission *
                                    product.price) /
                                100
                            ).toFixed(2)
                        )
                    ).toFixed(2)
                ),
                dealerTotalAmount: Number(
                    (
                        Number(product.totalAmount.toFixed(2)) +
                        Number(
                            (
                                (singleProduct?.dealerCommission *
                                    product.totalAmount) /
                                100
                            ).toFixed(2)
                        )
                    ).toFixed(2)
                ),
                srPrice: Number(product?.srPrice?.toFixed(2)),
                srTotalAmount: Number(product?.srTotalAmount?.toFixed(2)),
            };

            orderDetails.summary = {
                orderedQuantity: product.quantity,
                soldQuantity: product.quantity,
            };

            return orderDetails;
        })
    );
    orderData.products = orderDetailsData;

    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        const result = await Order.create([orderData], { session });

        const products = orderData.products;

        if (products) {
            await Promise.all(
                products.map(async product => {
                    const productStock = await PickedProduct.find({
                        warehouse: warehouse._id,
                        product: product.product,
                    })
                        .session(session)
                        .sort('-insertedDate')
                        .limit(1);

                    if (productStock.length > 0) {
                        if (productStock[0].quantity < product.quantity) {
                            throw new AppError(
                                httpStatus.NOT_FOUND,
                                'Stock is too low'
                            );
                        }
                        await PickedProduct.findByIdAndUpdate(
                            productStock[0]._id,
                            { $inc: { quantity: -product.quantity } },
                            { session, new: true }
                        );
                    } else {
                        throw new AppError(
                            httpStatus.NOT_FOUND,
                            'No stock found for this product'
                        );
                    }
                })
            );
        }

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

// get all order
const getAllOrderFromDB = async (query: Record<string, unknown>) => {
    const fetchQuery = new QueryBuilder(
        Order.find()
            .populate('retailer')
            .populate('area')
            .populate('dealer')
            .populate('dsr')
            .populate('packingman')
            .populate('sr')
            .populate('products.product'),
        query
    )
        .search(['id', 'retailer.name', 'retailer.phone'])
        .filter()
        .sort()
        .paginate()
        .fields();

    const result = await fetchQuery.modelQuery;
    const meta = await fetchQuery.countTotal();
    return { result, meta };
};

// get single order
const getSingleOrderFromDB = async (id: string) => {
    const result = await Order.findOne({ id })
        .populate('retailer')
        .populate('area')
        .populate('dealer')
        .populate('dsr')
        .populate('packingman')
        .populate('sr')
        .populate('products.product');
    return result;
};

// update order product
const updateOrderProductIntoDB = async (
    id: string,
    productId: string,
    payload: { quantity: number }
) => {
    const order = await Order.findOne({ id });
    if (!order) {
        throw new AppError(httpStatus.NOT_FOUND, 'No Order Found');
    }

    const product = await Product.findOne({ id: productId });
    if (!product) {
        throw new AppError(httpStatus.NOT_FOUND, 'No product Found');
    }
    const product_id = product._id;

    const productIndex = order?.products.findIndex(
        product => product.product.toString() === product_id.toString()
    );
    if (productIndex === -1) {
        throw new AppError(httpStatus.NOT_FOUND, 'Product not found in order');
    }

    const currentProduct = order?.products[productIndex as number];
    // const previousQuantity = currentProduct?.quantity;

    await Order.findByIdAndUpdate(
        order?._id,
        {
            $set: {
                'products.$[product].quantity': payload?.quantity,
                'products.$[product].totalAmount': Number(
                    (
                        (currentProduct.price / product.quantityPerPackage) *
                        payload.quantity
                    ).toFixed(2)
                ),
                'products.$[product].dealerTotalAmount': Number(
                    (
                        (Number(currentProduct.dealerPrice) /
                            product.quantityPerPackage) *
                        payload.quantity
                    ).toFixed(2)
                ),
                'products.$[product].srTotalAmount': Number(
                    (
                        (Number(currentProduct.srPrice) /
                            product.quantityPerPackage) *
                        payload.quantity
                    ).toFixed(2)
                ),
            },
        },
        { arrayFilters: [{ 'product.product': product._id }] }
    );

    const result = Order.findById(order?._id).populate('products.product');

    return result;
};

// dispatch order
const dispatchOrderIntoDB = async (
    query: Record<string, unknown>,
    payload: { dsr: string },
    userPayload: JwtPayload
) => {
    const fetchQuery = { status: query?.status } as Record<string, unknown>;
    if (query?.sr) {
        fetchQuery.sr = {
            $in: (query.sr as string[]).map(
                (item: string) => new Types.ObjectId(item)
            ),
        };
    }
    if (query?.createdAt) {
        fetchQuery.createdAt = {
            $gte: moment
                .tz(
                    (query.createdAt as { gte: string; lte: string }).gte,
                    TIMEZONE
                )
                .startOf('day')
                .format(),
            $lte: moment
                .tz(
                    (query.createdAt as { gte: string; lte: string }).lte,
                    TIMEZONE
                )
                .endOf('day')
                .format(),
        };
    }

    const orders = await Order.find(fetchQuery).select('_id');
    if (!orders) {
        throw new AppError(httpStatus.NOT_FOUND, 'No Orders Found');
    }

    const orderIDs = orders.map(order => new Types.ObjectId(order._id));

    const packingman = await User.findOne({ id: userPayload.userId });
    if (!packingman) {
        throw new AppError(httpStatus.NOT_FOUND, 'No packingman Found');
    }

    const dsr = await User.findOne({ id: payload.dsr });
    if (!dsr) {
        throw new AppError(httpStatus.NOT_FOUND, 'No dsr Found');
    }

    await Order.updateMany(
        { _id: { $in: orderIDs } },
        {
            $set: {
                dsr: dsr._id,
                packingman: packingman._id,
                basket: 'M',
                status: 'Dispatched',
                updatedAt: moment().tz(TIMEZONE).format(),
            },
        }
    );

    return null;
};

// cancel order
const cancelOrderIntoDB = async (
    id: string,
    payload: { cancelledReason: string },
    userPayload: JwtPayload
) => {
    const order = await Order.findOne({ id });
    if (!order) {
        throw new AppError(httpStatus.NOT_FOUND, 'No Order Found');
    }

    const user = await User.findOne({ id: userPayload.userId });
    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, 'No Dsr Found');
    }

    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        const result = await Order.findByIdAndUpdate(
            order?._id,
            {
                dsr: user._id,
                status: 'Cancelled',
                cancelledReason: payload?.cancelledReason,
                cancelledTime: moment().tz(TIMEZONE).format(),
                updatedAt: moment().tz(TIMEZONE).format(),
            },
            { session, new: true }
        );

        for (const productDetails of order.products) {
            const productId = productDetails.product;

            // Fetch the product from the collection and update stock
            const product = await Product.findById(productId).session(session);
            if (!product) {
                throw new Error(`Product not found: ${productId}`);
            }
            if (productDetails.summary?.orderedQuantity) {
                await Product.findByIdAndUpdate(
                    productId,
                    {
                        $inc: {
                            stock: productDetails.summary.orderedQuantity || 0,
                        },
                    },
                    { session }
                );
            }
        }
        await order.save({ session });
        await session.commitTransaction();
        await session.endSession();
        return result;
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

// update order product by sr
const updateOrderProductBySrIntoDB = async (
    id: string,
    productId: string,
    payload: { quantity: number; srPrice: number }
) => {
    const order = await Order.findOne({ id });
    if (!order) {
        throw new AppError(httpStatus.NOT_FOUND, 'No Order Found');
    }
    const product = await Product.findOne({ id: productId });
    if (!product) {
        throw new AppError(httpStatus.NOT_FOUND, 'No product Found');
    }
    const product_id = product._id;
    const productIndex = order?.products.findIndex(
        product => product.product.toString() === product_id.toString()
    );
    if (productIndex === -1) {
        throw new AppError(httpStatus.NOT_FOUND, 'Product not found in order');
    }
    const currentProduct = order?.products[productIndex as number];

    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        await Order.findByIdAndUpdate(
            order?._id,
            {
                $set: {
                    'products.$[product].quantity': payload?.quantity,
                    'products.$[product].totalAmount': Number(
                        (
                            (currentProduct.price /
                                product.quantityPerPackage) *
                            payload.quantity
                        ).toFixed(2)
                    ),
                    'products.$[product].dealerTotalAmount': Number(
                        (
                            (Number(currentProduct.dealerPrice) /
                                product.quantityPerPackage) *
                            payload.quantity
                        ).toFixed(2)
                    ),
                    'products.$[product].srTotalAmount': Number(
                        (
                            (Number(payload.srPrice) /
                                product.quantityPerPackage) *
                            payload.quantity
                        ).toFixed(2)
                    ),
                    'products.$[product].srPrice': Number(
                        payload.srPrice.toFixed(2)
                    ),
                    'products.$[product].summary.orderedQuantity':
                        payload?.quantity,
                },
            },
            {
                session,
                arrayFilters: [{ 'product.product': product._id }],
            }
        );
        const orderDetailsForPrices = await Order.findOne({
            order: order?._id,
        })
            .session(session)
            .select('products');
        const collectionAmount = (
            orderDetailsForPrices as IOrder
        ).products.reduce(
            (acc, product) => (acc += Number(product.srTotalAmount)),
            0
        );
        const result = await Order.findByIdAndUpdate(
            order?._id,
            {
                collectionAmount: Math.ceil(collectionAmount),
                updatedAt: moment().tz(TIMEZONE).format(),
            },
            { session, new: true }
        );
        await session.commitTransaction();
        await session.endSession();

        return result;
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

// deliver order
const deliverOrderIntoDB = async (
    id: string,
    payload: Partial<IOrder>,
    userPayload: JwtPayload
) => {
    const user = await User.findOne({ id: userPayload.userId });
    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, 'No Dsr Found');
    }

    const order = await Order.findOne({ id, dsr: user._id });
    if (!order) {
        throw new AppError(httpStatus.NOT_FOUND, 'No Order Found');
    }

    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        order.status = 'Delivered';
        order.paymentStatus = 'Paid';
        order.collectionAmount = Number(payload?.collectionAmount);
        order.collectedAmount = Number(
            payload?.collectedAmount || payload?.collectionAmount
        );

        if (payload.products && payload.products.length > 0) {
            for (const updatedProd of payload.products) {
                const existingProd = order.products.find(
                    p => p.product.toString() === updatedProd.product.toString()
                );

                if (existingProd) {
                    existingProd.quantity = updatedProd.quantity;
                    existingProd.totalAmount = updatedProd.totalAmount;
                    existingProd.dealerTotalAmount =
                        updatedProd.dealerTotalAmount;
                    existingProd.srTotalAmount = updatedProd.srTotalAmount;
                    (existingProd.summary as IOrderSummary).soldQuantity =
                        updatedProd.quantity;
                }
            }
        }

        // set delivery metadata
        order.deliveredTime = moment().tz(TIMEZONE).format();
        order.updatedAt = moment().tz(TIMEZONE).format();

        // update inventory for each delivered product
        for (const prod of order.products) {
            const todayStart = moment().startOf('day').format();
            const todayEnd = moment().endOf('day').format();

            await Inventory.findOneAndUpdate(
                {
                    dsr: user._id,
                    product: prod.product,
                    createdAt: { $gte: todayStart, $lte: todayEnd },
                },
                {
                    $inc: { sellQuantity: prod.quantity },
                    $set: { updatedAt: moment().endOf('day').format() },
                },
                { session }
            );

            // if (!inventory) {
            //     throw new AppError(
            //         httpStatus.NOT_FOUND,
            //         `No inventory found for product ${prod.product} today`
            //     );
            // }

            // // increment sellQuantity
            // inventory.sellQuantity += prod.quantity;
            // inventory.updatedAt = moment().endOf('day').format();
            // await inventory.save({ session });
        }

        const result = await order.save({ session });

        await session.commitTransaction();
        await session.endSession();

        return result;
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

// update baki order
const updateBakiOrderIntoDB = async (
    id: string,
    payload: Partial<IOrder>,
    userPayload: JwtPayload
) => {
    const user = await User.findOne({ id: userPayload.userId });
    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, 'No Dsr Found');
    }

    const order = await Order.findOne({ id, dsr: user._id });
    if (!order) {
        throw new AppError(httpStatus.NOT_FOUND, 'No Order Found');
    }

    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        order.collectionAmount = Number(payload?.collectionAmount);
        order.collectedAmount =
            order.collectedAmount +
            Number(payload?.collectedAmount || payload?.collectionAmount);
        order.status =
            order.collectionAmount === order.collectedAmount
                ? 'Delivered'
                : 'Baki';
        order.paymentStatus =
            order.collectedAmount === 0
                ? 'Unpaid'
                : order.collectionAmount === order.collectedAmount
                ? 'Paid'
                : 'Partial Paid';

        if (payload.products && payload.products.length > 0) {
            for (const updatedProd of payload.products) {
                const existingProd = order.products.find(
                    p => p.product.toString() === updatedProd.product.toString()
                );

                if (existingProd) {
                    const previousSoldQuantity = (
                        existingProd.summary as IOrderSummary
                    ).soldQuantity;

                    existingProd.quantity = updatedProd.quantity;
                    existingProd.totalAmount = updatedProd.totalAmount;
                    existingProd.dealerTotalAmount =
                        updatedProd.dealerTotalAmount;
                    existingProd.srTotalAmount = updatedProd.srTotalAmount;
                    (existingProd.summary as IOrderSummary).soldQuantity =
                        updatedProd.quantity;

                    order.deliveredTime = moment().tz(TIMEZONE).format();
                    order.updatedAt = moment().tz(TIMEZONE).format();

                    const todayStart = moment().startOf('day').format();
                    const todayEnd = moment().endOf('day').format();

                    await Inventory.findOneAndUpdate(
                        {
                            dsr: user._id,
                            product: existingProd.product,
                            createdAt: { $gte: todayStart, $lte: todayEnd },
                        },
                        {
                            $inc: {
                                sellQuantity:
                                    existingProd.quantity -
                                    Number(previousSoldQuantity),
                            },
                            $set: { updatedAt: moment().endOf('day').format() },
                        },
                        { session }
                    );
                }
            }
        }

        const result = await order.save({ session });

        await session.commitTransaction();
        await session.endSession();

        return result;
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

// get order summary
const getOrderSummaryFromDB = async (query: Record<string, unknown>) => {
    // Order.find({ status: { $ne: 'Cancelled' } }).select('_id')
    // const fetchQuery = new QueryBuilder(Order.find().select('_id'), query)
    //     .filter()
    //     .sort()
    //     .fields();
    // const orders = await fetchQuery.modelQuery;
    // if (!orders) {
    //     throw new AppError(httpStatus.NOT_FOUND, 'No Order Found');
    // }
    // const orderIDs = orders.map(order => new Types.ObjectId(order._id));
    // const result = await OrderDetails.aggregate([
    //     { $match: { order: { $in: orderIDs } } },
    //     { $unwind: '$products' },
    //     {
    //         $lookup: {
    //             from: 'products',
    //             localField: 'products.product',
    //             foreignField: '_id',
    //             as: 'productDetails',
    //         },
    //     },
    //     {
    //         $unwind: '$productDetails',
    //     },
    //     {
    //         $addFields: {
    //             oc: {
    //                 $subtract: [
    //                     '$products.srTotalAmount',
    //                     { $ifNull: ['$products.dealerTotalAmount', 0] },
    //                 ],
    //             },
    //         },
    //     },
    //     {
    //         $group: {
    //             _id: '$products.product',
    //             productName: { $first: '$productDetails.name' },
    //             quantityPerPackage: {
    //                 $first: '$productDetails.quantityPerPackage',
    //             },
    //             packageType: { $first: '$productDetails.packageType' },
    //             image: { $first: '$productDetails.image' },
    //             totalQuantity: { $sum: '$products.inventory.out' },
    //             totalSaleQuantity: { $sum: '$products.inventory.sale' },
    //             totalOrder: { $sum: 1 },
    //             totalOc: { $sum: '$oc' },
    //             totalPrice: { $sum: '$products.srTotalAmount' },
    //         },
    //     },
    //     {
    //         $project: {
    //             _id: 0,
    //             productName: 1,
    //             packageType: 1,
    //             image: 1,
    //             quantityPerPackage: 1,
    //             totalQuantity: 1,
    //             totalSaleQuantity: 1,
    //             totalOrder: 1,
    //             totalOc: 1,
    //             totalPrice: 1,
    //         },
    //     },
    // ]);
    // return result;
};

// get order history
const getOrderHistoryFromDB = async (query: Record<string, unknown>) => {
    const srId = query?.sr ? new Types.ObjectId(query.sr as string) : null;
    const dealerId = query?.dealer
        ? new Types.ObjectId(query.dealer as string)
        : null;
    const createdAt = query?.createdAt;
    const areaIds = query?.area ? query?.area : [];

    if (!createdAt) {
        throw new AppError(httpStatus.BAD_REQUEST, 'Missing Date');
    }

    if (!srId && !dealerId) {
        throw new AppError(httpStatus.BAD_REQUEST, 'Missing SR or Dealer ID');
    }

    const startOfDay = moment
        .tz(createdAt, TIMEZONE)
        .startOf('day')
        .format('YYYY-MM-DDTHH:mm:ssZ');
    const endOfDay = moment
        .tz(createdAt, TIMEZONE)
        .endOf('day')
        .format('YYYY-MM-DDTHH:mm:ssZ');

    const fetchQuery = new QueryBuilder(
        Union.find().select('id name').sort('name'),
        { _id: areaIds, page: query?.page || 1, limit: query?.limit || 10 }
    )
        .filter()
        .sort()
        .paginate();

    const unions = await fetchQuery.modelQuery;
    const meta = await fetchQuery.countTotal();
    if (unions.length === 0) {
        return { result: [], meta };
    }

    const result = await Promise.all(
        unions.map(async union => {
            const retailers = await Retailer.find({
                union: union._id,
            }).populate('retailer');

            const orders = await Promise.all(
                retailers.map(async retailer => {
                    const ordersData = await Order.find({
                        retailer: retailer.retailer._id,
                        area: union._id,
                        createdAt: { $gte: startOfDay, $lte: endOfDay },
                        ...(srId && { sr: srId }),
                        ...(dealerId && { dealer: dealerId }),
                    }).select('id retailer collectionAmount status');

                    return {
                        ...retailer.toObject(),
                        orders: ordersData,
                    };
                })
            );

            const filteredRetailers = orders.filter(
                order => order.orders.length > 0
            );

            return {
                ...union.toObject(),
                retailerCount: filteredRetailers.length,
                retailers: filteredRetailers,
            };
        })
    );

    return { result, meta };
};

// get order counting
const getOrderCountingFromDB = async (query: Record<string, unknown>) => {
    const totalOrder = await Order.countDocuments({ ...query });
    const totalCompleted = await Order.countDocuments({
        ...query,
        status: 'Delivered',
    });
    const totalCancelled = await Order.countDocuments({
        ...query,
        status: 'Cancelled',
    });

    return { totalOrder, totalCompleted, totalCancelled };
};

// delete order
const deleteOrderFromDB = async (id: string) => {
    const order = await Order.findOne({ id }).select('_id');
    if (!order) {
        throw new AppError(httpStatus.NOT_FOUND, 'No Order Found');
    }

    const result = await Order.findByIdAndDelete(order._id);
};

// delete many order
const deleteManyOrderFromDB = async (payload: { id: string[] }) => {
    const orders = await Order.find({ id: { $in: payload.id } }).select('_id');
    if (!orders) {
        throw new AppError(httpStatus.NOT_FOUND, 'No Order Found');
    }

    const orderIDs = orders.map(order => order._id);

    await Order.deleteMany({ _id: { $in: orderIDs } });
};

export const OrderServices = {
    createOrderIntoDB,
    createReadyOrderIntoDB,
    getAllOrderFromDB,
    getSingleOrderFromDB,
    updateOrderProductIntoDB,
    dispatchOrderIntoDB,
    cancelOrderIntoDB,
    updateOrderProductBySrIntoDB,
    deliverOrderIntoDB,
    updateBakiOrderIntoDB,
    getOrderSummaryFromDB,
    getOrderHistoryFromDB,
    getOrderCountingFromDB,
    deleteOrderFromDB,
    deleteManyOrderFromDB,
};

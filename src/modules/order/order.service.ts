import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { User } from '../user/user.model';
import {
    ICreateOrder,
    IOrder,
    IOrderDetails,
    IOrderDetailsProduct,
} from './order.interface';
import generateOrderId from '../../utils/generateOrderId';
import { Area } from '../area/area.model';
import mongoose, { Types } from 'mongoose';
import { Order, OrderDetails } from './order.model';
import { Product } from '../product/product.model';
import QueryBuilder from '../../builder/QueryBuilder';
import moment from 'moment-timezone';
import { TIMEZONE } from '../../constant';
import { JwtPayload } from 'jsonwebtoken';
import { Retailer } from '../retailer/retailer.model';
import { CustomerCareData } from '../customerCare/customerCare.model';

// create order
const createOrderIntoDB = async (payload: ICreateOrder) => {
    const retailer = await User.findOne({ id: payload?.retailer });
    if (!retailer) {
        throw new AppError(httpStatus.NOT_FOUND, 'No Retailer Found');
    }

    const area = await Area.findOne({ id: payload?.area });
    if (!area) {
        throw new AppError(httpStatus.NOT_FOUND, 'No Area Found');
    }

    const dealer = await User.findById(payload?.dealer);
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
        area: area?._id,
        dealer: dealer?._id,
        sr: sr?._id,
        dsr: dsr?._id,
        status: payload?.status || 'Processing',
        paymentStatus: payload?.paymentStatus || 'Unpaid',
        collectionAmount: Math.ceil(payload?.collectionAmount),
        location: payload?.location,
    };

    if (!orderData?.sr) {
        delete orderData?.sr;
    }
    if (!orderData?.dsr) {
        delete orderData?.dsr;
    }
    if (orderData?.dsr) {
        if (orderData.status === 'Baki' && payload?.requestDate) {
            orderData.collectedAmount = Math.ceil(
                Number(payload?.collectedAmount)
            );
        } else {
            orderData.collectedAmount = Math.ceil(payload?.collectionAmount);
        }
    }
    if (!orderData?.location) {
        delete orderData?.location;
    }

    orderData.id = await generateOrderId([
        String(payload?.retailer),
        String(dealer.id),
        String(payload?.sr || payload?.dsr),
    ]);

    const orderDetailsData: Partial<IOrderDetails> = {
        products: await Promise.all(
            payload?.products.map(async product => {
                const singleProduct = await Product.findOne({
                    id: product.product,
                });
                if (!singleProduct) {
                    throw new AppError(
                        httpStatus.NOT_FOUND,
                        'No Product Found'
                    );
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
                };

                if (orderData?.sr) {
                    orderDetails.srPrice = Number(product?.srPrice?.toFixed(2));
                    orderDetails.srTotalAmount = Number(
                        product?.srTotalAmount?.toFixed(2)
                    );
                    orderDetails.inventory = {
                        out: product.quantity,
                        sale: 0,
                        in: 0,
                    };
                }
                if (orderData?.dsr) {
                    orderDetails.inventory = {
                        out: 0,
                        sale: product.quantity,
                        in: -product.quantity,
                    };
                }

                return orderDetails;
            })
        ),
    };

    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        const createdOrder = await Order.create([orderData], { session });
        orderDetailsData.order = createdOrder[0]?._id;

        await OrderDetails.findOneAndUpdate(
            { order: createdOrder[0]?._id },
            orderDetailsData,
            { session, upsert: true, new: true }
        );

        if (orderData.status === 'Baki') {
            await CustomerCareData.findOneAndUpdate(
                { order: createdOrder[0]?._id },
                {
                    order: createdOrder[0]?._id,
                    retailer: orderData.retailer,
                    dsr: orderData.dsr,
                    requestType: 'Baki',
                    status: 'Interest',
                    requestDate: moment
                        .tz(payload?.requestDate, TIMEZONE)
                        .startOf('day')
                        .format(),
                },
                { session, upsert: true, new: true }
            );
        }

        await session.commitTransaction();
        await session.endSession();

        const result = OrderDetails.findOne({
            order: createdOrder[0]?._id,
        })
            .populate('order')
            .populate('products.product');

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

// get all order
const getAllOrderFromDB = async (query: Record<string, unknown>) => {
    const fetchQuery = new QueryBuilder(
        Order.find()
            .populate('retailer')
            .populate('area')
            .populate('dealer')
            .populate('dsr')
            .populate('packingman')
            .populate('sr'),
        query
    )
        .search(['id'])
        .filter()
        .sort()
        .paginate()
        .fields();

    const result = await fetchQuery.modelQuery;
    const meta = await fetchQuery.countTotal();
    return { result, meta };
};

// get all order details
const getAllOrderDetailsFromDB = async (query: Record<string, unknown>) => {
    const fetchQuery = new QueryBuilder(
        OrderDetails.find().populate('order').populate('products.product'),
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

// get single order
const getSingleOrderFromDB = async (id: string) => {
    const order = await Order.findOne({ id })
        .populate('retailer')
        .populate('area')
        .populate('dealer')
        .populate('dsr')
        .populate('packingman')
        .populate('sr');
    if (!order) {
        throw new AppError(httpStatus.NOT_FOUND, 'No Order Found');
    }
    const result = await OrderDetails.findOne({ order: order._id }).populate(
        'products.product'
    );
    return { order, products: result?.products };
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

    const orderDetails = await OrderDetails.findOne({ order: order._id });
    if (!orderDetails) {
        throw new AppError(httpStatus.NOT_FOUND, 'No order details found');
    }

    const productIndex = orderDetails?.products.findIndex(
        product => product.product.toString() === product_id.toString()
    );
    if (productIndex === -1) {
        throw new AppError(httpStatus.NOT_FOUND, 'Product not found in order');
    }

    const currentProduct = orderDetails?.products[productIndex as number];
    const previousQuantity = currentProduct?.quantity;

    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        await OrderDetails.findOneAndUpdate(
            { order: order?._id },
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
                            (Number(currentProduct.srPrice) /
                                product.quantityPerPackage) *
                            payload.quantity
                        ).toFixed(2)
                    ),
                    'products.$[product].isEdited': {
                        isEdited: true,
                        previousQuantity,
                    },
                },
            },
            {
                session,
                arrayFilters: [{ 'product.product': product._id }],
            }
        );

        await session.commitTransaction();
        await session.endSession();

        const result = OrderDetails.findOne({
            order: order?._id,
        })
            .populate('order')
            .populate('products.product');

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

// cancel order product
const cancelOrderProductIntoDB = async (
    id: string,
    productId: string,
    payload: { cancelledReason: string }
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

    const orderDetails = await OrderDetails.findOne({ order: order._id });
    if (!orderDetails) {
        throw new AppError(httpStatus.NOT_FOUND, 'No order details found');
    }

    const productIndex = orderDetails?.products.findIndex(
        product => product.product.toString() === product_id.toString()
    );
    if (productIndex === -1) {
        throw new AppError(httpStatus.NOT_FOUND, 'Product not found in order');
    }

    const differencePieces =
        orderDetails?.products[productIndex as number].quantity;

    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        await OrderDetails.findOneAndUpdate(
            { order: order?._id },
            {
                $set: {
                    'products.$[product].isCancelled': {
                        isCancelled: true,
                        cancelledTime: moment().tz(TIMEZONE).format(),
                        cancelledReason: payload.cancelledReason,
                    },
                    'products.$[product].totalAmount': 0,
                    'products.$[product].dealerTotalAmount': 0,
                    'products.$[product].srTotalAmount': 0,
                    'products.$[product].inventory.in': differencePieces,
                    'products.$[product].inventory.sale': 0,
                },
            },
            {
                session,
                arrayFilters: [{ 'product.product': product._id }],
            }
        );

        const orderDetailsForPrices = await OrderDetails.findOne({
            order: order?._id,
        }).session(session);

        const collectionAmount = (
            orderDetailsForPrices as IOrderDetails
        ).products.reduce(
            (acc, product) => (acc += Number(product.srTotalAmount)),
            0
        );

        await Order.findByIdAndUpdate(
            order?._id,
            {
                collectionAmount: Math.ceil(collectionAmount),
                updatedAt: moment().tz(TIMEZONE).format(),
            },
            { session }
        );

        await session.commitTransaction();
        await session.endSession();

        const result = OrderDetails.findOne({
            order: order?._id,
        })
            .populate('order')
            .populate('products.product');

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

// dispatch order
const dispatchOrderIntoDB = async (
    id: string,
    payload: { basket: string },
    userPayload: JwtPayload
) => {
    const order = await Order.findOne({ id });
    if (!order) {
        throw new AppError(httpStatus.NOT_FOUND, 'No Order Found');
    }

    const orderDetails = await OrderDetails.findOne({ order: order._id });
    if (!orderDetails) {
        throw new AppError(httpStatus.NOT_FOUND, 'No Order Found');
    }

    const packingman = await User.findOne({ id: userPayload.userId });
    if (!packingman) {
        throw new AppError(httpStatus.NOT_FOUND, 'No packingman Found');
    }

    const collectionAmount = orderDetails.products.reduce(
        (acc, product) => (acc += Number(product.srTotalAmount)),
        0
    );

    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        await Order.findByIdAndUpdate(
            order?._id,
            {
                packingman: packingman._id,
                basket: payload.basket,
                collectionAmount: Math.ceil(collectionAmount),
                status: 'Dispatched',
                updatedAt: moment().tz(TIMEZONE).format(),
            },
            { session }
        );

        await OrderDetails.findOneAndUpdate(
            { order: order?._id },
            [
                {
                    $set: {
                        products: {
                            $map: {
                                input: '$products',
                                as: 'product',
                                in: {
                                    $mergeObjects: [
                                        '$$product',
                                        {
                                            inventory: {
                                                out: '$$product.quantity',
                                                sale: 0,
                                                in: 0,
                                            },
                                        },
                                    ],
                                },
                            },
                        },
                    },
                },
            ],
            { session }
        );

        await session.commitTransaction();
        await session.endSession();

        const result = OrderDetails.findOne({
            order: order?._id,
        })
            .populate('order')
            .populate('products.product');

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

    const orderDetails = await OrderDetails.findOne({ order: order._id });
    if (!orderDetails) {
        throw new AppError(httpStatus.NOT_FOUND, 'No order details found');
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

        for (const productDetails of orderDetails.products) {
            const productId = productDetails.product;

            // Clone inventory.out to inventory.in
            productDetails.inventory = productDetails.inventory || {};
            productDetails.inventory.in = productDetails.inventory.out || 0;
            productDetails.inventory.sale = 0;

            // Fetch the product from the collection and update stock
            const product = await Product.findById(productId).session(session);
            if (!product) {
                throw new Error(`Product not found: ${productId}`);
            }

            if (productDetails.inventory.out) {
                await Product.findByIdAndUpdate(
                    productId,
                    {
                        $inc: { stock: productDetails.inventory.out || 0 },
                    },
                    { session }
                );
            }
        }
        await orderDetails.save({ session });

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

// update order product by deliveryman
const updateOrderProductByDeliverymanIntoDB = async (
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

    const orderDetails = await OrderDetails.findOne({ order: order._id });
    if (!orderDetails) {
        throw new AppError(httpStatus.NOT_FOUND, 'No order details found');
    }

    const productIndex = orderDetails?.products.findIndex(
        product => product.product.toString() === product_id.toString()
    );
    if (productIndex === -1) {
        throw new AppError(httpStatus.NOT_FOUND, 'Product not found in order');
    }

    const currentProduct = orderDetails?.products[productIndex as number];
    const previousQuantity = currentProduct?.quantity;

    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        await OrderDetails.findOneAndUpdate(
            { order: order?._id },
            {
                $set: {
                    'products.$[product].quantity': payload?.quantity,
                    'products.$[product].inventory.sale': payload?.quantity,
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
                            (Number(currentProduct.srPrice) /
                                product.quantityPerPackage) *
                            payload.quantity
                        ).toFixed(2)
                    ),
                },
                $inc: {
                    'products.$[product].inventory.in':
                        previousQuantity - payload?.quantity,
                },
            },
            {
                session,
                arrayFilters: [{ 'product.product': product._id }],
            }
        );

        const orderDetailsForPrices = await OrderDetails.findOne({
            order: order?._id,
        }).session(session);

        const collectionAmount = (
            orderDetailsForPrices as IOrderDetails
        ).products.reduce(
            (acc, product) => (acc += Number(product.srTotalAmount)),
            0
        );

        await Order.findByIdAndUpdate(
            order?._id,
            {
                collectionAmount: Math.ceil(collectionAmount),
                updatedAt: moment().tz(TIMEZONE).format(),
            },
            { session }
        );

        await session.commitTransaction();
        await session.endSession();

        const result = OrderDetails.findOne({
            order: order?._id,
        })
            .populate('order')
            .populate('products.product');

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

    const orderDetails = await OrderDetails.findOne({ order: order._id });
    if (!orderDetails) {
        throw new AppError(httpStatus.NOT_FOUND, 'No order details found');
    }

    const productIndex = orderDetails?.products.findIndex(
        product => product.product.toString() === product_id.toString()
    );
    if (productIndex === -1) {
        throw new AppError(httpStatus.NOT_FOUND, 'Product not found in order');
    }

    const currentProduct = orderDetails?.products[productIndex as number];
    const previousQuantity = currentProduct?.quantity;

    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        await OrderDetails.findOneAndUpdate(
            { order: order?._id },
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
                            (Number(currentProduct.srPrice) /
                                product.quantityPerPackage) *
                            payload.quantity
                        ).toFixed(2)
                    ),
                    'products.$[product].isEdited': {
                        isEdited: true,
                        previousQuantity,
                    },
                },
            },
            {
                session,
                arrayFilters: [{ 'product.product': product._id }],
            }
        );

        const orderDetailsForPrices = await OrderDetails.findOne({
            order: order?._id,
        }).session(session);

        const collectionAmount = (
            orderDetailsForPrices as IOrderDetails
        ).products.reduce(
            (acc, product) => (acc += Number(product.srTotalAmount)),
            0
        );

        await Order.findByIdAndUpdate(
            order?._id,
            {
                collectionAmount: Math.ceil(collectionAmount),
                updatedAt: moment().tz(TIMEZONE).format(),
            },
            { session }
        );

        await session.commitTransaction();
        await session.endSession();

        const result = OrderDetails.findOne({
            order: order?._id,
        })
            .populate('order')
            .populate('products.product');

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
    payload: {
        requestDate?: string;
        status: 'Baki' | 'Delivered';
        collectedAmount: number;
    },
    userPayload: JwtPayload
) => {
    const order = await Order.findOne({ id });
    if (!order) {
        throw new AppError(httpStatus.NOT_FOUND, 'No Order Found');
    }

    const orderDetails = await OrderDetails.findOne({ order: order._id });
    if (!orderDetails) {
        throw new AppError(httpStatus.NOT_FOUND, 'No Order details Found');
    }

    const user = await User.findOne({ id: userPayload.userId });
    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, 'No Dsr Found');
    }

    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        const deliverOrder = await Order.findByIdAndUpdate(
            order._id,
            {
                dsr: user._id,
                status: payload.status,
                $inc: { collectedAmount: payload.collectedAmount },
            },
            { session, new: true }
        );

        const result = await Order.findByIdAndUpdate(
            order._id,
            {
                paymentStatus:
                    deliverOrder?.collectionAmount ===
                    deliverOrder?.collectedAmount
                        ? 'Paid'
                        : 'Partial Paid',
            },
            { session, new: true }
        );

        if (payload?.requestDate) {
            await CustomerCareData.findOneAndUpdate(
                { order: order._id },
                {
                    requestDate: moment
                        .tz(payload?.requestDate, TIMEZONE)
                        .startOf('day')
                        .format(),
                    updatedAt: moment().tz(TIMEZONE).format(),
                },
                { session, new: true }
            );
        }

        if (payload.status === 'Delivered') {
            for (const productDetails of orderDetails.products) {
                const productId = productDetails.product;

                // Clone inventory.out to inventory.in
                productDetails.inventory = productDetails.inventory || {};

                // Fetch the product from the collection and update stock
                const product = await Product.findById(productId).session(
                    session
                );
                if (!product) {
                    throw new Error(`Product not found: ${productId}`);
                }

                if (productDetails.inventory.in) {
                    await Product.findByIdAndUpdate(
                        productId,
                        {
                            $inc: { stock: productDetails.inventory.in || 0 },
                        },
                        { session }
                    );
                }
            }
        }

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

// get order inventory
const getOrderInventoryFromDB = async (query: Record<string, unknown>) => {
    const fetchQuery = new QueryBuilder(
        Order.find({
            status: {
                $in: [
                    'Dispatched',
                    'Delivered',
                    'Cancelled',
                    'Pending',
                    'Baki',
                ],
            },
        }).select('_id'),
        query
    )
        .filter()
        .sort()
        .fields();

    const orders = await fetchQuery.modelQuery;
    if (!orders) {
        throw new AppError(httpStatus.NOT_FOUND, 'No Order Found');
    }

    const orderIDs = orders.map(order => new Types.ObjectId(order._id));

    const result = await OrderDetails.aggregate([
        { $match: { order: { $in: orderIDs } } },
        { $unwind: '$products' },
        {
            $lookup: {
                from: 'products',
                localField: 'products.product',
                foreignField: '_id',
                as: 'productDetails',
            },
        },
        { $unwind: '$productDetails' },
        {
            $addFields: {
                srPricePerUnit: {
                    $cond: [
                        { $gt: ['$products.srPrice', 0] },
                        {
                            $divide: [
                                '$products.srPrice',
                                '$productDetails.quantityPerPackage',
                            ],
                        },
                        0,
                    ],
                },
            },
        },
        {
            $group: {
                _id: null,
                totalOut: {
                    $sum: {
                        $ifNull: ['$products.inventory.out', 0],
                    },
                },
                totalOutPrice: {
                    $sum: {
                        $cond: [
                            { $gt: ['$products.inventory.out', 0] },
                            {
                                $multiply: [
                                    '$products.inventory.out',
                                    '$srPricePerUnit',
                                ],
                            },
                            0,
                        ],
                    },
                },
                totalSale: {
                    $sum: {
                        $ifNull: ['$products.inventory.sale', 0],
                    },
                },
                totalSalePrice: {
                    $sum: {
                        $cond: [
                            { $gt: ['$products.inventory.sale', 0] },
                            {
                                $multiply: [
                                    '$products.inventory.sale',
                                    '$srPricePerUnit',
                                ],
                            },
                            0,
                        ],
                    },
                },
                totalIn: {
                    $sum: {
                        $ifNull: ['$products.inventory.in', 0],
                    },
                },
                totalInPrice: {
                    $sum: {
                        $cond: [
                            { $gt: ['$products.inventory.in', 0] },
                            {
                                $multiply: [
                                    '$products.inventory.in',
                                    '$srPricePerUnit',
                                ],
                            },
                            0,
                        ],
                    },
                },
            },
        },
        {
            $project: {
                _id: 0,
                totalOut: 1,
                totalOutPrice: { $round: ['$totalOutPrice', 2] },
                totalSale: 1,
                totalSalePrice: { $round: ['$totalSalePrice', 2] },
                totalIn: 1,
                totalInPrice: { $round: ['$totalInPrice', 2] },
            },
        },
    ]);

    return (
        result[0] || {
            totalOut: 0,
            totalOutPrice: 0,
            totalSale: 0,
            totalSalePrice: 0,
            totalIn: 0,
            totalInPrice: 0,
        }
    );
};

// get order inventory details
const getOrderInventoryDetailsFromDB = async (
    query: Record<string, unknown>
) => {
    const fetchQuery = new QueryBuilder(
        Order.find({
            status: {
                $in: [
                    'Dispatched',
                    'Delivered',
                    'Cancelled',
                    'Pending',
                    'Baki',
                ],
            },
        }).select('_id'),
        query
    )
        .filter()
        .sort()
        .fields();

    const orders = await fetchQuery.modelQuery;
    if (!orders) {
        throw new AppError(httpStatus.NOT_FOUND, 'No Order Found');
    }

    const orderIDs = orders.map(order => new Types.ObjectId(order._id));

    const result = await OrderDetails.aggregate([
        { $match: { order: { $in: orderIDs } } },
        { $unwind: '$products' },
        {
            $lookup: {
                from: 'products',
                localField: 'products.product',
                foreignField: '_id',
                as: 'productDetails',
            },
        },
        { $unwind: '$productDetails' },
        {
            $addFields: {
                srPricePerUnit: {
                    $cond: [
                        { $gt: ['$products.srPrice', 0] },
                        {
                            $divide: [
                                '$products.srPrice',
                                '$productDetails.quantityPerPackage',
                            ],
                        },
                        0,
                    ],
                },
                oc: {
                    $subtract: [
                        '$products.srTotalAmount',
                        { $ifNull: ['$products.dealerTotalAmount', 0] },
                    ],
                },
            },
        },
        {
            $group: {
                _id: '$productDetails._id',
                product: { $first: '$productDetails.name' },
                quantityPerPackage: {
                    $first: '$productDetails.quantityPerPackage',
                },
                oc: { $sum: '$oc' },
                totalOut: {
                    $sum: {
                        $ifNull: ['$products.inventory.out', 0],
                    },
                },
                totalOutPrice: {
                    $sum: {
                        $cond: [
                            { $gt: ['$products.inventory.out', 0] },
                            {
                                $multiply: [
                                    '$products.inventory.out',
                                    '$srPricePerUnit',
                                ],
                            },
                            0,
                        ],
                    },
                },
                totalSale: {
                    $sum: {
                        $ifNull: ['$products.inventory.sale', 0],
                    },
                },
                totalSalePrice: {
                    $sum: {
                        $cond: [
                            { $gt: ['$products.inventory.sale', 0] },
                            {
                                $multiply: [
                                    '$products.inventory.sale',
                                    '$srPricePerUnit',
                                ],
                            },
                            0,
                        ],
                    },
                },
                totalIn: {
                    $sum: {
                        $ifNull: ['$products.inventory.in', 0],
                    },
                },
                totalInPrice: {
                    $sum: {
                        $cond: [
                            { $gt: ['$products.inventory.in', 0] },
                            {
                                $multiply: [
                                    '$products.inventory.in',
                                    '$srPricePerUnit',
                                ],
                            },
                            0,
                        ],
                    },
                },
            },
        },
        {
            $project: {
                _id: 0,
                product: 1,
                quantityPerPackage: 1,
                oc: 1,
                totalOut: 1,
                totalOutPrice: { $ceil: '$totalOutPrice' },
                totalSale: 1,
                totalSalePrice: { $ceil: '$totalSalePrice' },
                totalIn: 1,
                totalInPrice: { $ceil: '$totalInPrice' },
            },
        },
    ]);

    return result;
};

const getOrderSummaryFromDB = async (query: Record<string, unknown>) => {
    const fetchQuery = new QueryBuilder(
        Order.find({ status: { $ne: 'Cancelled' } }).select('_id'),
        query
    )
        .filter()
        .sort()
        .fields();

    const orders = await fetchQuery.modelQuery;
    if (!orders) {
        throw new AppError(httpStatus.NOT_FOUND, 'No Order Found');
    }

    const orderIDs = orders.map(order => new Types.ObjectId(order._id));

    const result = await OrderDetails.aggregate([
        { $match: { order: { $in: orderIDs } } },
        { $unwind: '$products' },
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
            $addFields: {
                oc: {
                    $subtract: [
                        '$products.srTotalAmount',
                        { $ifNull: ['$products.dealerTotalAmount', 0] },
                    ],
                },
            },
        },
        {
            $group: {
                _id: '$products.product',
                productName: { $first: '$productDetails.name' },
                quantityPerPackage: {
                    $first: '$productDetails.quantityPerPackage',
                },
                packageType: { $first: '$productDetails.packageType' },
                image: { $first: '$productDetails.image' },
                totalQuantity: { $sum: '$products.inventory.out' },
                totalSaleQuantity: { $sum: '$products.inventory.sale' },
                totalOrder: { $sum: 1 },
                totalOc: { $sum: '$oc' },
                totalPrice: { $sum: '$products.srTotalAmount' },
            },
        },
        {
            $project: {
                _id: 0,
                productName: 1,
                packageType: 1,
                image: 1,
                quantityPerPackage: 1,
                totalQuantity: 1,
                totalSaleQuantity: 1,
                totalOrder: 1,
                totalOc: 1,
                totalPrice: 1,
            },
        },
    ]);

    return result;
};

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
        Area.find().select('id name').sort('name'),
        { _id: areaIds, page: query?.page || 1, limit: query?.limit || 10 }
    )
        .filter()
        .sort()
        .paginate();

    const areas = await fetchQuery.modelQuery;
    const meta = await fetchQuery.countTotal();
    if (areas.length === 0) {
        return { result: [], meta };
    }

    const result = await Promise.all(
        areas.map(async area => {
            const retailers = await Retailer.find({
                area: area._id,
            }).populate('retailer');

            const orders = await Promise.all(
                retailers.map(async retailer => {
                    const ordersData = await Order.find({
                        retailer: retailer.retailer._id,
                        area: area._id,
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
                ...area.toObject(),
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
    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        const result = await Order.findByIdAndDelete(order._id, { session });
        await OrderDetails.findOneAndDelete({ order: order._id }, { session });

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

export const OrderServices = {
    createOrderIntoDB,
    getAllOrderFromDB,
    getAllOrderDetailsFromDB,
    getSingleOrderFromDB,
    updateOrderProductIntoDB,
    cancelOrderProductIntoDB,
    dispatchOrderIntoDB,
    cancelOrderIntoDB,
    updateOrderProductByDeliverymanIntoDB,
    updateOrderProductBySrIntoDB,
    deliverOrderIntoDB,
    getOrderInventoryFromDB,
    getOrderInventoryDetailsFromDB,
    getOrderSummaryFromDB,
    getOrderHistoryFromDB,
    getOrderCountingFromDB,
    deleteOrderFromDB,
};

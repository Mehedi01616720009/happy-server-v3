import { model, Schema } from 'mongoose';
import { IOrder, IOrderDetailsProduct } from './order.interface';
import moment from 'moment-timezone';
import { TIMEZONE } from '../../constant';
import { ILocation } from '../retailer/retailer.interface';

// location schema
const locationSchema = new Schema<ILocation>({
    latitude: {
        type: Number,
        required: [true, 'Latitude is required'],
    },
    longitude: {
        type: Number,
        required: [true, 'Latitude is required'],
    },
});

// order summary schema
const orderSummarySchema = new Schema({
    orderedQuantity: {
        type: Number,
    },
    packedQuantity: {
        type: Number,
    },
    soldQuantity: {
        type: Number,
    },
});

// order cancel schema
const orderCancelSchema = new Schema({
    isCancelled: {
        type: Boolean,
        default: false,
    },
    cancelledTime: {
        type: String,
    },
    cancelledReason: {
        type: String,
    },
});

// order details product schema
const orderDetailsProductSchema = new Schema<IOrderDetailsProduct>({
    product: {
        type: Schema.Types.ObjectId,
        required: [true, 'Product ID is required'],
        ref: 'Product',
    },
    quantity: {
        type: Number,
        required: [true, 'Quantity is required'],
    },
    price: {
        type: Number,
        required: [true, 'Price is required'],
    },
    totalAmount: {
        type: Number,
        required: [true, 'Total Amount is required'],
    },
    dealerPrice: {
        type: Number,
        required: [true, 'Dealer Price is required'],
    },
    dealerTotalAmount: {
        type: Number,
        required: [true, 'Dealer Total Amount is required'],
    },
    srPrice: {
        type: Number,
    },
    srTotalAmount: {
        type: Number,
    },
    summary: {
        type: orderSummarySchema,
    },
    isCancelled: {
        type: orderCancelSchema,
    },
});

// order schema
const orderSchema = new Schema<IOrder>({
    id: {
        type: String,
        required: [true, 'Order ID is required'],
        unique: true,
    },
    retailer: {
        type: Schema.Types.ObjectId,
        required: [true, 'Retailer ID is required'],
        ref: 'User',
    },
    area: {
        type: Schema.Types.ObjectId,
        required: [true, 'Area is required'],
        ref: 'Union',
    },
    dealer: {
        type: Schema.Types.ObjectId,
        required: [true, 'Dealer ID is required'],
        ref: 'User',
    },
    sr: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    dsr: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    packingman: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    basket: {
        type: String,
    },
    status: {
        type: String,
        enum: {
            values: [
                'Pending',
                'Baki',
                'Customer Care',
                'Processing',
                'Dispatched',
                'Delivered',
                'Cancelled',
            ],
            message: '{VALUE} is invalid status',
        },
        default: 'Processing',
    },
    paymentStatus: {
        type: String,
        enum: {
            values: ['Paid', 'Unpaid', 'Partial Paid'],
            message: '{VALUE} is invalid status',
        },
        default: 'Unpaid',
    },
    collectionAmount: {
        type: Number,
        required: [true, 'Collection Amount is required'],
    },
    collectedAmount: {
        type: Number,
        default: 0,
    },
    products: {
        type: [orderDetailsProductSchema],
    },
    createdAt: {
        type: String,
        default: () => moment().tz(TIMEZONE).format(),
    },
    updatedAt: {
        type: String,
        default: () => moment().tz(TIMEZONE).format(),
    },
    insertedDate: {
        type: Date,
        default: () => moment().tz(TIMEZONE).toDate(),
    },
    deliveredTime: {
        type: String,
    },
    cancelledTime: {
        type: String,
    },
    cancelledReason: {
        type: String,
    },
});

// order model
export const Order = model<IOrder>('Order', orderSchema);

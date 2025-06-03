import { model, Schema } from 'mongoose';
import { IPackingman, IPickedProduct, IPickupman } from './pickupMan.interface';
import moment from 'moment-timezone';
import { TIMEZONE } from '../../constant';

// picked product schema
const pickedProductSchema = new Schema<IPickedProduct>({
    dealer: {
        type: Schema.Types.ObjectId,
        required: [true, 'Dealer ID is required'],
        ref: 'User',
    },
    pickupman: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    warehouse: {
        type: Schema.Types.ObjectId,
        ref: 'Warehouse',
    },
    product: {
        type: Schema.Types.ObjectId,
        required: [true, 'Product ID is required'],
        ref: 'Product',
    },
    prevQuantity: {
        type: Number,
        required: [true, 'Order Quantity is required'],
    },
    newQuantity: {
        type: Number,
        required: [true, 'Out Quantity is required'],
    },
    quantity: {
        type: Number,
        required: [true, 'Out Quantity is required'],
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
});

// pickupman schema
const pickupmanSchema = new Schema<IPickupman>({
    pickupman: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        unique: true,
    },
    warehouse: {
        type: Schema.Types.ObjectId,
        ref: 'Warehouse',
    },
});

// packingman schema
const packingmanSchema = new Schema<IPackingman>({
    packingman: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        unique: true,
    },
    warehouse: {
        type: Schema.Types.ObjectId,
        ref: 'Warehouse',
    },
});

// picked product model
export const PickedProduct = model<IPickedProduct>(
    'PickedProduct',
    pickedProductSchema
);

// pickupman model
export const Pickupman = model<IPickupman>('Pickupman', pickupmanSchema);

// pickupman model
export const Packingman = model<IPackingman>('Packingman', packingmanSchema);

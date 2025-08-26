import { Schema, model } from 'mongoose';
import { IInventory } from './inventory.interface';
import moment from 'moment-timezone';
import { TIMEZONE } from '../../constant';

const inventorySchema = new Schema<IInventory>({
    packingman: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    dsr: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    warehouse: {
        type: Schema.Types.ObjectId,
        ref: 'Warehouse',
        required: true,
    },
    product: {
        type: Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
    },
    outQuantity: {
        type: Number,
        required: true,
        min: 0,
    },
    sellQuantity: {
        type: Number,
        default: 0,
    },
    isReturned: {
        type: Boolean,
        default: false,
    },
    createdAt: {
        type: String,
        default: () => moment().tz(TIMEZONE).format(),
    },
    updatedAt: {
        type: String,
        default: () => moment().tz(TIMEZONE).format(),
    },
});

export const Inventory = model<IInventory>('Inventory', inventorySchema);

import { model, Schema } from "mongoose";
import { IInProduct } from "./inproduct.interface";
import moment from "moment-timezone";
import { TIMEZONE } from "../../constant";

// in product schema
const inProductSchema = new Schema<IInProduct>({
    dsr: {
        type: Schema.Types.ObjectId,
        required: [true, 'Dsr ID is required'],
        ref: 'User',
    },
    warehouse: {
        type: Schema.Types.ObjectId,
        required: [true, 'Warehouse ID is required'],
        ref: 'Warehouse',
    },
    product: {
        type: Schema.Types.ObjectId,
        required: [true, 'Product ID is required'],
        ref: 'Product',
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

// in product model
export const InProduct = model<IInProduct>(
    'InProduct',
    inProductSchema
);
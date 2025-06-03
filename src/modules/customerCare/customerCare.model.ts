import { model, Schema } from 'mongoose';
import { ICustomerCareData } from './customerCare.interface';
import moment from 'moment-timezone';
import { TIMEZONE } from '../../constant';

// customer care data schema
const customerCareDataSchema = new Schema<ICustomerCareData>({
    order: {
        type: Schema.Types.ObjectId,
        required: [true, 'Order ID is required'],
        ref: 'Order',
        unique: true,
    },
    retailer: {
        type: Schema.Types.ObjectId,
        required: [true, 'Retailer ID is required'],
        ref: 'User',
    },
    dsr: {
        type: Schema.Types.ObjectId,
        required: [true, 'Dsr ID is required'],
        ref: 'User',
    },
    requestType: {
        type: String,
        enum: {
            values: ['Pending', 'Baki'],
            message: '{VALUE} is invalid status',
        },
        required: [true, 'Request Type is required'],
    },
    status: {
        type: String,
        enum: {
            values: ['New', 'Interest', 'Not Interest', 'Not Reach'],
            message: '{VALUE} is invalid status',
        },
        default: 'New',
    },
    pendingReason: {
        type: String,
    },
    notInterestReason: {
        type: String,
    },
    requestDate: {
        type: String,
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

// customer care data model
export const CustomerCareData = model<ICustomerCareData>(
    'CustomerCareData',
    customerCareDataSchema
);

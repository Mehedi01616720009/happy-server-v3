import { model, Schema } from 'mongoose';
import { IDamage } from './damage.interface';
import moment from 'moment-timezone';
import { TIMEZONE } from '../../constant';

// damage schema
const damageSchema = new Schema<IDamage>({
    company: {
        type: Schema.Types.ObjectId,
        required: [true, 'Company is required'],
        ref: 'Company',
    },
    dealer: {
        type: Schema.Types.ObjectId,
        required: [true, 'Dealer is required'],
        ref: 'User',
    },
    retailer: {
        type: Schema.Types.ObjectId,
        required: [true, 'Retailer is required'],
        ref: 'User',
    },
    dsr: {
        type: Schema.Types.ObjectId,
        required: [true, 'Dsr is required'],
        ref: 'User',
    },
    note: {
        type: String,
        required: [true, 'Reason is required'],
    },
    amount: {
        type: Number,
        required: [true, 'Amount is required'],
    },
    reason: {
        type: String,
        required: [true, 'Reason is required'],
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

// damage model
export const Damage = model<IDamage>('Damage', damageSchema);

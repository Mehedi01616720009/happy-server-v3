import { model, Schema } from 'mongoose';
import { ISr } from './sr.interface';

// sr schema
const srSchema = new Schema<ISr>({
    sr: {
        type: Schema.Types.ObjectId,
        required: [true, 'User ID is required'],
        ref: 'User',
        unique: true,
    },
    dealers: {
        type: [Schema.Types.ObjectId],
        required: [true, 'Dealer is required'],
        ref: 'User',
    },
    companies: {
        type: [Schema.Types.ObjectId],
        required: [true, 'Company is required'],
        ref: 'Company',
    },
    upazilas: {
        type: [Schema.Types.ObjectId],
        required: [true, 'Upazila is required'],
        ref: 'Upazila',
    },
    warehouse: {
        type: Schema.Types.ObjectId,
        ref: 'Warehouse',
    },
});

// sr model
export const Sr = model<ISr>('Sr', srSchema);

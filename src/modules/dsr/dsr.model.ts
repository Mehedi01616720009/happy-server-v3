import { model, Schema } from 'mongoose';
import { IDsr } from './dsr.interface';

// dsr schema
const dsrSchema = new Schema<IDsr>({
    dsr: {
        type: Schema.Types.ObjectId,
        required: [true, 'User ID is required'],
        ref: 'User',
        unique: true,
    },
    upazilas: {
        type: [Schema.Types.ObjectId],
        required: [true, 'Upazilas is required'],
        ref: 'Upazila',
    },
});

// dsr model
export const Dsr = model<IDsr>('Dsr', dsrSchema);

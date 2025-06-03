import { model, Schema } from 'mongoose';
import { IUpazila } from './upazila.interface';

// upazila schema
const upazilaSchema = new Schema<IUpazila>({
    id: {
        type: String,
        required: [true, 'User ID is required'],
        unique: true,
    },
    district: {
        type: String,
        required: [true, 'District is required'],
    },
    name: {
        type: String,
        required: [true, 'Name is required'],
    },
    bnName: {
        type: String,
        required: [true, 'Bangla name is required'],
    },
});

// upazila model
export const Upazila = model<IUpazila>('Upazila', upazilaSchema);

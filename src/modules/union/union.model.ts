import { model, Schema } from 'mongoose';
import { IUnion } from './union.interface';

// union schema
const unionSchema = new Schema<IUnion>({
    id: {
        type: String,
        required: [true, 'User ID is required'],
        unique: true,
    },
    upazila: {
        type: Schema.Types.ObjectId,
        required: [true, 'Upazila is required'],
        ref: 'Upazila',
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

// union model
export const Union = model<IUnion>('Union', unionSchema);

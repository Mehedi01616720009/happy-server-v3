import { model, Schema } from 'mongoose';
import { IArea } from './area.interface';

// area schema
const areaSchema = new Schema<IArea>({
    id: {
        type: String,
        required: [true, 'User ID is required'],
        unique: true,
    },
    union: {
        type: Schema.Types.ObjectId,
        required: [true, 'Union is required'],
        ref: 'Union',
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

// area model
export const Area = model<IArea>('Area', areaSchema);

import { model, Schema } from 'mongoose';
import { ITag } from './tag.interface';
import moment from 'moment-timezone';
import { TIMEZONE } from '../../constant';

// tags schema
const tagsSchema = new Schema<ITag>({
    name: {
        type: String,
        required: [true, 'Name is required'],
    },
    value: {
        type: Number,
        required: [true, 'Value is required'],
        unique: true,
    },
    type: {
        type: String,
        enum: {
            values: ['box', 'peice'],
            message: '{VALUE} is invalid status',
        },
        required: [true, 'Type is required'],
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

// tags model
export const Tag = model<ITag>('Tag', tagsSchema);

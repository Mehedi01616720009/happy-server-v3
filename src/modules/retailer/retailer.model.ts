import { model, Schema, Types } from 'mongoose';
import { ILocation, IRetailer } from './retailer.interface';

// location schema
const locationSchema = new Schema<ILocation>({
    latitude: {
        type: Number,
        required: [true, 'Latitude is required'],
    },
    longitude: {
        type: Number,
        required: [true, 'Latitude is required'],
    },
});

// retailer schema
const retailerSchema = new Schema<IRetailer>({
    retailer: {
        type: Schema.Types.ObjectId,
        required: [true, 'User ID is required'],
        ref: 'User',
        unique: true,
    },
    shopName: {
        type: String,
        required: [true, 'Shop name is required'],
    },
    union: {
        type: Schema.Types.ObjectId,
        required: [true, 'Union is required'],
        ref: 'Union',
    },
    area: {
        type: Schema.Types.ObjectId,
        required: [true, 'Area is required'],
        ref: 'Area',
    },
    environment: {
        type: String,
    },
    location: {
        type: locationSchema,
        required: [true, 'Location name is required'],
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        default: new Types.ObjectId('67696bd132b7e908c43c5959'),
        ref: 'User',
    },
});

// retailer model
export const Retailer = model<IRetailer>('Retailer', retailerSchema);

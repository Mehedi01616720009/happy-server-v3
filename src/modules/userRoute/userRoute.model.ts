import { model, Schema } from 'mongoose';
import { ISrRouteDay, IUserRoute } from './userRoute.interface';

// user route schema
const userRouteSchema = new Schema<IUserRoute>({
    user: {
        type: Schema.Types.ObjectId,
        required: [true, 'User ID is required'],
        ref: 'User',
        unique: true,
    },
    sunday: {
        type: [Schema.Types.ObjectId],
        ref: 'Area',
    },
    monday: {
        type: [Schema.Types.ObjectId],
        ref: 'Area',
    },
    tuesday: {
        type: [Schema.Types.ObjectId],
        ref: 'Area',
    },
    wednesday: {
        type: [Schema.Types.ObjectId],
        ref: 'Area',
    },
    thursday: {
        type: [Schema.Types.ObjectId],
        ref: 'Area',
    },
    friday: {
        type: [Schema.Types.ObjectId],
        ref: 'Area',
    },
    saturday: {
        type: [Schema.Types.ObjectId],
        ref: 'Area',
    },
});

// sr route day schema
const srRouteDaySchema = new Schema<ISrRouteDay>({
    user: {
        type: Schema.Types.ObjectId,
        required: [true, 'User ID is required'],
        ref: 'User',
    },
    routes: {
        type: [Schema.Types.ObjectId],
        required: [true, 'At least one area is required'],
        ref: 'Area',
    },
    taskDate: {
        type: Date,
        required: [true, 'Date is required'],
    },
});

// user route model
export const UserRoute = model<IUserRoute>('UserRoute', userRouteSchema);

// sr route day model
export const SrRouteDay = model<ISrRouteDay>('SrRouteDay', srRouteDaySchema);

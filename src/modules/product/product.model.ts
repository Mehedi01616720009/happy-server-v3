import { model, Schema } from 'mongoose';
import { IProduct } from './product.interface';
import moment from 'moment-timezone';
import { TIMEZONE } from '../../constant';

// product schema
const productSchema = new Schema<IProduct>({
    id: {
        type: String,
        required: [true, 'Product ID is required'],
        unique: true,
    },
    name: {
        type: String,
        required: [true, 'Name is required'],
    },
    bnName: {
        type: String,
        required: [true, 'Bangla name is required'],
    },
    category: {
        type: Schema.Types.ObjectId,
        required: [true, 'Category ID is required'],
        ref: 'Category',
    },
    company: {
        type: Schema.Types.ObjectId,
        required: [true, 'Company ID is required'],
        ref: 'Company',
    },
    dealer: {
        type: Schema.Types.ObjectId,
        required: [true, 'Dealer ID is required'],
        ref: 'User',
    },
    packageType: {
        type: String,
        required: [true, 'Package type is required'],
    },
    quantityPerPackage: {
        type: Number,
        required: [true, 'Quantity is required'],
    },
    stock: {
        type: Number,
    },
    price: {
        type: Number,
        required: [true, 'Price is required'],
    },
    dealerCommission: {
        type: Number,
        required: [true, 'Dealer commission is required'],
    },
    ourCommission: {
        type: Number,
        required: [true, 'Our commission is required'],
    },
    status: {
        type: String,
        enum: {
            values: ['Active', 'Disabled'],
            message: '{VALUE} is invalid status',
        },
        default: 'Active',
    },
    image: {
        type: String,
        required: [true, 'Image is required'],
    },
    tags: {
        type: [String],
        ref: 'Tag',
    },
    isDeleted: {
        type: Boolean,
        default: false,
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

// product model
export const Product = model<IProduct>('Product', productSchema);

import { model, Schema } from 'mongoose';
import moment from 'moment-timezone';
import { TIMEZONE } from '../../constant';
import { IWarehouse, IWarehouseModel } from './warehouse.interface';

// warehouse schema
const warehouseSchema = new Schema<IWarehouse>({
    id: {
        type: String,
        required: [true, 'ID is required'],
        unique: true,
    },
    name: {
        type: String,
        required: [true, 'Name is required'],
    },
    address: {
        type: String,
        required: [true, 'Address is required'],
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

// warehouse model static function (isWarehouseExistById)
warehouseSchema.statics.isWarehouseExistById = async function (id: string) {
    return await Warehouse.findOne({ id });
};

// warehouse model
export const Warehouse = model<IWarehouse, IWarehouseModel>(
    'Warehouse',
    warehouseSchema
);

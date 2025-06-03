import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import generateSlug from '../../utils/generateSlug';
import { IWarehouse } from './warehouse.interface';
import { Warehouse } from './warehouse.model';
import QueryBuilder from '../../builder/QueryBuilder';
import moment from 'moment-timezone';
import { TIMEZONE } from '../../constant';

// create warehouse
const createWarehouseIntoDB = async (payload: IWarehouse) => {
    const warehouseData: IWarehouse = {
        ...payload,
    };

    warehouseData.id = await generateSlug(payload.name);
    const warehouse = await Warehouse.isWarehouseExistById(warehouseData.id);
    if (warehouse) {
        throw new AppError(httpStatus.IM_USED, 'This id has already exist');
    }

    const result = await Warehouse.create(warehouseData);
    return result;
};

// get all Warehouse
const getAllWarehouseFromDB = async (query: Record<string, unknown>) => {
    const fetchQuery = new QueryBuilder(Warehouse.find(), query)
        .search(['name'])
        .filter()
        .sort()
        .paginate()
        .fields();

    const result = await fetchQuery.modelQuery;
    const meta = await fetchQuery.countTotal();
    return { result, meta };
};

// get single Warehouse
const getSingleWarehouseFromDB = async (id: string) => {
    const result = Warehouse.findOne({ id });
    return result;
};

// update Warehouse
const updateWarehouseIntoDB = async (
    id: string,
    payload: { name?: string; address?: string }
) => {
    const warehouse = await Warehouse.findOne({ id, isDeleted: false });
    if (!warehouse) {
        throw new AppError(httpStatus.NOT_FOUND, 'No warehouse found');
    }

    const result = Warehouse.findOneAndUpdate(
        { id },
        { ...payload, updatedAt: moment().tz(TIMEZONE).format() },
        { new: true }
    );
    return result;
};

// delete Warehouse
const deleteWarehouseFromDB = async (id: string) => {
    const result = Warehouse.findOneAndUpdate(
        { id },
        {
            isDeleted: true,
            updatedAt: moment().tz(TIMEZONE).format(),
        },
        { new: true }
    );
    return result;
};

export const WarehouseServices = {
    createWarehouseIntoDB,
    getAllWarehouseFromDB,
    getSingleWarehouseFromDB,
    updateWarehouseIntoDB,
    deleteWarehouseFromDB,
};

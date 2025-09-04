import httpStatus from 'http-status';
import { IInventory } from './inventory.interface';
import { Inventory } from './inventory.model';
import { Warehouse } from '../warehouse/warehouse.model';
import AppError from '../../errors/AppError';
import { Product } from '../product/product.model';
import { User } from '../user/user.model';
import moment from 'moment-timezone';
import mongoose, { Types } from 'mongoose';
import { PickedProduct } from '../pickupMan/pickupMan.model';
import QueryBuilder from '../../builder/QueryBuilder';
import { TIMEZONE } from '../../constant';

// create inventory
const createInventoryIntoDB = async (payload: IInventory) => {
    const warehouse = await Warehouse.findOne({
        id: payload?.warehouse,
    }).select('_id');
    if (!warehouse) {
        throw new AppError(httpStatus.NOT_FOUND, 'No warehouse found');
    }

    const product = await Product.findOne({ id: payload?.product }).select(
        '_id dealer'
    );
    if (!product) {
        throw new AppError(httpStatus.NOT_FOUND, 'No product found');
    }

    const packingman = await User.findOne({ id: payload?.packingman }).select(
        '_id'
    );
    if (!packingman) {
        throw new AppError(httpStatus.NOT_FOUND, 'No packingman found');
    }

    const dsr = await User.findOne({ id: payload?.dsr }).select('_id');
    if (!dsr) {
        throw new AppError(httpStatus.NOT_FOUND, 'No dsr found');
    }

    // existing inventory data
    const existingInventory = await Inventory.findOne({
        warehouse: warehouse._id,
        product: product._id,
        packingman: packingman._id,
        createdAt: {
            $gte: moment().startOf('day').format(),
            $lte: moment().endOf('day').format(),
        },
    });

    const previousQuantity = existingInventory
        ? existingInventory.outQuantity
        : 0;
    const difference = payload.outQuantity - previousQuantity;

    const inventoryData: IInventory = {
        ...payload,
    };
    inventoryData.warehouse = warehouse._id;
    inventoryData.product = product._id;
    inventoryData.packingman = packingman._id;
    inventoryData.dsr = dsr._id;
    inventoryData.dealer = product.dealer;

    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        const result = await Inventory.findOneAndUpdate(
            {
                warehouse: warehouse._id,
                product: product._id,
                packingman: packingman._id,
                createdAt: {
                    $gte: moment().startOf('day').format(),
                    $lte: moment().endOf('day').format(),
                },
            },
            inventoryData,
            {
                session,
                upsert: true,
                new: true,
                setDefaultsOnInsert: true,
            }
        );

        const productStock = await PickedProduct.find({
            warehouse: warehouse._id,
            product: product._id,
        })
            .session(session)
            .sort('-insertedDate')
            .limit(1);

        if (productStock.length > 0) {
            if (productStock[0].quantity < difference) {
                throw new AppError(httpStatus.NOT_FOUND, 'Stock is too low');
            }
            await PickedProduct.findByIdAndUpdate(
                productStock[0]._id,
                { $inc: { quantity: -difference } },
                { session, new: true }
            );
        } else {
            throw new AppError(httpStatus.NOT_FOUND, 'No stock found');
        }

        await session.commitTransaction();
        await session.endSession();

        return result;
    } catch (err) {
        await session.abortTransaction();
        await session.endSession();
        throw new AppError(
            httpStatus.BAD_REQUEST,
            'Mongoose transaction failed',
            err as string
        );
    }
};

// create alt inventory
const createAltInventoryIntoDB = async (payload: IInventory) => {
    const warehouse = await Warehouse.findOne({
        id: payload?.warehouse,
    }).select('_id');
    if (!warehouse) {
        throw new AppError(httpStatus.NOT_FOUND, 'No warehouse found');
    }

    const product = await Product.findOne({ id: payload?.product }).select(
        '_id dealer'
    );
    if (!product) {
        throw new AppError(httpStatus.NOT_FOUND, 'No product found');
    }

    const packingman = await User.findOne({ id: payload?.packingman }).select(
        '_id'
    );
    if (!packingman) {
        throw new AppError(httpStatus.NOT_FOUND, 'No packingman found');
    }

    const dsr = await User.findOne({ id: payload?.dsr }).select('_id');
    if (!dsr) {
        throw new AppError(httpStatus.NOT_FOUND, 'No dsr found');
    }

    const inventoryData: IInventory = {
        ...payload,
    };
    inventoryData.warehouse = warehouse._id;
    inventoryData.product = product._id;
    inventoryData.packingman = packingman._id;
    inventoryData.dsr = dsr._id;
    inventoryData.dealer = product.dealer;

    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        const result = await Inventory.findOneAndUpdate(
            {
                warehouse: warehouse._id,
                product: product._id,
                packingman: packingman._id,
                createdAt: {
                    $gte: moment().startOf('day').format(),
                    $lte: moment().endOf('day').format(),
                },
            },
            {
                $setOnInsert: {
                    warehouse: warehouse._id,
                    product: product._id,
                    packingman: packingman._id,
                    dsr: dsr._id,
                },
                $inc: {
                    outQuantity: payload.outQuantity,
                },
            },
            {
                upsert: true,
                new: true,
                setDefaultsOnInsert: true,
            }
        );

        const productStock = await PickedProduct.find({
            warehouse: warehouse._id,
            product: product._id,
        })
            .session(session)
            .sort('-insertedDate')
            .limit(1);

        if (productStock.length > 0) {
            if (productStock[0].quantity < payload.outQuantity) {
                throw new AppError(httpStatus.NOT_FOUND, 'Stock is too low');
            }
            await PickedProduct.findByIdAndUpdate(
                productStock[0]._id,
                { $inc: { quantity: -payload.outQuantity } },
                { session, new: true }
            );
        } else {
            throw new AppError(httpStatus.NOT_FOUND, 'No stock found');
        }

        await session.commitTransaction();
        await session.endSession();

        return result;
    } catch (err) {
        await session.abortTransaction();
        await session.endSession();
        throw new AppError(
            httpStatus.BAD_REQUEST,
            'Mongoose transaction failed',
            err as string
        );
    }
};

// get all inventories
const getAllInventoriesFromDB = async (query: Record<string, unknown>) => {
    const dsr = new Types.ObjectId(query?.dsr as string);
    const dealer = new Types.ObjectId(query?.dealer as string);
    const createdAt = query?.createdAt;
    const matchStages: Record<string, unknown> = {};
    if (createdAt) {
        matchStages.dsr = dsr;
    }
    if (dealer) {
        matchStages.dealer = dealer;
    }
    if (createdAt) {
        matchStages.createdAt = {
            $gte: moment
                .tz((createdAt as { gte: string; lte: string }).gte, TIMEZONE)
                .startOf('day')
                .format(),
            $lte: moment
                .tz((createdAt as { gte: string; lte: string }).lte, TIMEZONE)
                .endOf('day')
                .format(),
        };
    }

    const result = await Inventory.find(matchStages).populate(
        'product',
        '_id id name bnName packageType quantityPerPackage image'
    );
    return result;
};

// update return product inventory
const updateReturnProductInventoryIntoDB = async (payload: {
    warehouse: string;
    product: string;
    dsr: string;
}) => {
    const warehouse = await Warehouse.findById(payload?.warehouse).select(
        '_id'
    );
    if (!warehouse) {
        throw new AppError(httpStatus.NOT_FOUND, 'No warehouse found');
    }

    const product = await Product.findById(payload?.product).select('_id');
    if (!product) {
        throw new AppError(httpStatus.NOT_FOUND, 'No product found');
    }

    const dsr = await User.findById(payload?.dsr).select('_id');
    if (!dsr) {
        throw new AppError(httpStatus.NOT_FOUND, 'No dsr found');
    }

    const inventory = await Inventory.findOne({
        warehouse: warehouse._id,
        product: product._id,
        dsr: dsr._id,
        createdAt: {
            $gte: moment().startOf('day').format(),
            $lte: moment().endOf('day').format(),
        },
    });
    if (!inventory) {
        throw new AppError(httpStatus.NOT_FOUND, 'No inventory found');
    }

    const returnQuantity = inventory.outQuantity - inventory.sellQuantity;

    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        const result = await Inventory.findByIdAndUpdate(
            inventory?._id,
            { isReturned: true, updatedAt: moment().tz(TIMEZONE).format() },
            { new: true }
        );

        const productStock = await PickedProduct.find({
            warehouse: warehouse._id,
            product: product._id,
        })
            .session(session)
            .sort('-insertedDate')
            .limit(1);

        if (productStock.length > 0) {
            await PickedProduct.findByIdAndUpdate(
                productStock[0]._id,
                { $inc: { quantity: returnQuantity } },
                { session, new: true }
            );
        } else {
            throw new AppError(httpStatus.NOT_FOUND, 'No stock found');
        }

        await session.commitTransaction();
        await session.endSession();

        return result;
    } catch (err) {
        await session.abortTransaction();
        await session.endSession();
        throw new AppError(
            httpStatus.BAD_REQUEST,
            'Mongoose transaction failed',
            err as string
        );
    }
};

export const InventoryServices = {
    createInventoryIntoDB,
    createAltInventoryIntoDB,
    getAllInventoriesFromDB,
    updateReturnProductInventoryIntoDB,
};

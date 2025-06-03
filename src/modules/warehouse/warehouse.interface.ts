import { Model } from 'mongoose';

export interface IWarehouse {
    id: string;
    name: string;
    address: string;
    isDeleted: boolean;
    createdAt: string;
    updatedAt: string;
    insertedDate: Date;
}

// warehouse model interface
export interface IWarehouseModel extends Model<IWarehouse> {
    isWarehouseExistById(id: string): IWarehouse;
}

import { Types } from 'mongoose';

export interface IInventory {
    packingman: Types.ObjectId;
    dsr: Types.ObjectId;
    warehouse: Types.ObjectId;
    product: Types.ObjectId;
    dealer: Types.ObjectId;
    outQuantity: number;
    sellQuantity: number;
    isReturned: boolean;
    createdAt: string;
    updatedAt: string;
    insertedDate?: Date;
}

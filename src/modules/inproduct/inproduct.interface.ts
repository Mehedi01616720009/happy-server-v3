import { Types } from "mongoose";

export interface IInProduct {
    dsr: Types.ObjectId;
    warehouse: Types.ObjectId;
    product: Types.ObjectId;
    quantity: number;
    createdAt?: string;
    updatedAt?: string;
    insertedDate?: Date;
}
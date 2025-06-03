import { Types } from 'mongoose';

export interface IDamage {
    company: Types.ObjectId;
    dealer: Types.ObjectId;
    retailer: Types.ObjectId;
    dsr: Types.ObjectId;
    note: string;
    amount: number;
    reason: string;
    createdAt?: string;
    updatedAt?: string;
    insertedDate?: Date;
}

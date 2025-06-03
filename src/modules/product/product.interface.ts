import { Types } from 'mongoose';

export interface IProduct {
    id: string;
    name: string;
    bnName: string;
    category: Types.ObjectId;
    company: Types.ObjectId;
    dealer: Types.ObjectId;
    packageType: string;
    quantityPerPackage: number;
    stock?: number;
    price: number;
    dealerCommission: number;
    ourCommission: number;
    status: 'Active' | 'Disabled';
    image: string;
    tags?: Types.ObjectId[];
    isDeleted: boolean;
    createdAt: string;
    updatedAt: string;
    insertedDate: Date;
}

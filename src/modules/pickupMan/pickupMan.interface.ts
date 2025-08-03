import { Types } from 'mongoose';

export interface IPickedProduct {
    dealer: Types.ObjectId;
    pickupman: Types.ObjectId;
    warehouse: Types.ObjectId;
    product: Types.ObjectId;
    prevQuantity: number;
    newQuantity: number;
    quantity: number;
    price: number;
    createdAt?: string;
    updatedAt?: string;
    insertedDate?: Date;
}

export interface IPickupman {
    pickupman: Types.ObjectId;
    warehouse?: Types.ObjectId;
}

export interface IPackingman {
    packingman: Types.ObjectId;
    warehouse?: Types.ObjectId;
}

// b p
// quantity
// quantity per box
// b = floor(quantity / quantity per box)
// p = quantity % quantity per box

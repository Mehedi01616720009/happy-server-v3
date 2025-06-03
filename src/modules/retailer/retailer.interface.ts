import { Types } from 'mongoose';

export interface ILocation {
    latitude: number;
    longitude: number;
}

export interface IRetailer {
    retailer: Types.ObjectId;
    shopName: string;
    union: Types.ObjectId;
    area: Types.ObjectId;
    environment: string;
    location: ILocation;
    createdBy?: Types.ObjectId;
}

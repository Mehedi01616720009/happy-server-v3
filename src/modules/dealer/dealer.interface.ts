import { Types } from 'mongoose';

export interface IDealer {
    dealer: Types.ObjectId;
    companies: Types.ObjectId[];
}

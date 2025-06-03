import { Types } from 'mongoose';

export interface IArea {
    id: string;
    union: Types.ObjectId;
    name: string;
    bnName: string;
}

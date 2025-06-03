import { Types } from 'mongoose';

export interface ISr {
    sr: Types.ObjectId;
    dealers: Types.ObjectId[];
    companies: Types.ObjectId[];
    upazilas: Types.ObjectId[];
    warehouse?: Types.ObjectId;
}

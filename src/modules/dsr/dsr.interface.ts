import { Types } from 'mongoose';

export interface IDsr {
    dsr: Types.ObjectId;
    upazilas: Types.ObjectId[];
    sr: Types.ObjectId[];
}

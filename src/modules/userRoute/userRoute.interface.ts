import { Types } from 'mongoose';

export interface ISrRouteDay {
    user: Types.ObjectId;
    routes: Types.ObjectId[];
    taskDate: Date;
}

export interface IUserRoute {
    user: Types.ObjectId;
    sunday?: Types.ObjectId[];
    monday?: Types.ObjectId[];
    tuesday?: Types.ObjectId[];
    wednesday?: Types.ObjectId[];
    thursday?: Types.ObjectId[];
    friday?: Types.ObjectId[];
    saturday?: Types.ObjectId[];
}

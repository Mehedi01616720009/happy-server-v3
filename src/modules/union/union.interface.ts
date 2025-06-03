import { Types } from 'mongoose';

// union interface
export interface IUnion {
    id: string;
    upazila: Types.ObjectId;
    name: string;
    bnName: string;
}

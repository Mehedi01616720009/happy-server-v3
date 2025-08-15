import { Types } from 'mongoose';

export interface ICustomerCareData {
    order: Types.ObjectId;
    retailer: Types.ObjectId;
    dsr?: Types.ObjectId;
    requestType: 'Pending' | 'Baki';
    status: 'New' | 'Interest' | 'Not Interest' | 'Not Reach';
    pendingReason?: string;
    notInterestReason?: string;
    requestDate?: string;
    createdAt: string;
    updatedAt: string;
    insertedDate: Date;
}

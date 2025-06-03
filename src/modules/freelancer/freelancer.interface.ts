import { Types } from 'mongoose';

export interface IFreelancer {
    freelancer: Types.ObjectId;
    upazilas: Types.ObjectId[];
}

export interface IFreelancerWorkingData {
    retailer: Types.ObjectId;
    addedBy: Types.ObjectId;
    editedBy?: Types.ObjectId;
    createdAt: string;
    updatedAt: string;
    insertedDate: Date;
}

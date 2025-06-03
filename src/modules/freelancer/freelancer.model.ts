import { model, Schema } from 'mongoose';
import { IFreelancer, IFreelancerWorkingData } from './freelancer.interface';
import moment from 'moment-timezone';
import { TIMEZONE } from '../../constant';

// freelancer schema
const freelancerSchema = new Schema<IFreelancer>({
    freelancer: {
        type: Schema.Types.ObjectId,
        required: [true, 'User ID is required'],
        ref: 'User',
        unique: true,
    },
    upazilas: {
        type: [Schema.Types.ObjectId],
        required: [true, 'Upazilas is required'],
        ref: 'Upazila',
    },
});

// freelancer working data schema
const freelancerWorkingDataSchema = new Schema<IFreelancerWorkingData>({
    retailer: {
        type: Schema.Types.ObjectId,
        required: [true, 'Retailer ID is required'],
        ref: 'User',
        unique: true,
    },
    addedBy: {
        type: Schema.Types.ObjectId,
        required: [true, 'Freelancer ID is required'],
        ref: 'User',
    },
    editedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    createdAt: {
        type: String,
        default: () => moment().tz(TIMEZONE).format(),
    },
    updatedAt: {
        type: String,
        default: () => moment().tz(TIMEZONE).format(),
    },
    insertedDate: {
        type: Date,
        default: () => moment().tz(TIMEZONE).toDate(),
    },
});

// freelancer model
export const Freelancer = model<IFreelancer>('Freelancer', freelancerSchema);

// freelancer working data model
export const FreelancerWorkingData = model<IFreelancerWorkingData>(
    'FreelancerWorkingData',
    freelancerWorkingDataSchema
);

import { model, Schema } from 'mongoose';
import { ICompany, ICompanyModel } from './company.interface';

// company schema
const companySchema = new Schema<ICompany>({
    id: {
        type: String,
        required: [true, 'Company ID is required'],
        unique: true,
    },
    name: {
        type: String,
        required: [true, 'Name is required'],
    },
    bnName: {
        type: String,
        required: [true, 'Bangla name is required'],
    },
    image: {
        type: String,
        required: [true, 'Image is required'],
    },
    status: {
        type: String,
        enum: {
            values: ['Active', 'Disabled'],
            message: '{VALUE} is invalid status',
        },
        default: 'Active',
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },
});

// company model static function (isCompanyExistById)
companySchema.statics.isCompanyExistById = async function (id: string) {
    return await Company.findOne({ id });
};

// company model
export const Company = model<ICompany, ICompanyModel>('Company', companySchema);

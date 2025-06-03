import { model, Schema } from 'mongoose';
import { ICategory, ICategoryModel } from './category.interface';

// category schema
const categorySchema = new Schema<ICategory>({
    id: {
        type: String,
        required: [true, 'Category ID is required'],
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

// category model static function (isCategoryExistById)
categorySchema.statics.isCategoryExistById = async function (id: string) {
    return await Category.findOne({ id });
};

// category model
export const Category = model<ICategory, ICategoryModel>(
    'Category',
    categorySchema
);

import httpStatus from 'http-status';
import QueryBuilder from '../../builder/QueryBuilder';
import AppError from '../../errors/AppError';
import generateImageName from '../../utils/generateImageName';
import generateSlug from '../../utils/generateSlug';
import { sendImageToCloudinary } from '../../utils/sendImageToCloudinary';
import { ICategory } from './category.interface';
import { Category } from './category.model';

// create category
const createCategoryIntoDB = async (
    file: Express.Multer.File,
    payload: ICategory
) => {
    const categoryData: ICategory = {
        ...payload,
    };
    categoryData.id = await generateSlug(payload.name);

    if (file?.path) {
        // generate image name
        const imageName = generateImageName(categoryData.id);

        // wait for cloudinary response
        const image = await sendImageToCloudinary(imageName, file?.path);
        categoryData.image = image?.secure_url;
    }

    const result = await Category.create(categoryData);
    return result;
};

// get all category
const getAllCategoryFromDB = async (query: Record<string, unknown>) => {
    const fetchQuery = new QueryBuilder(
        Category.find({ isDeleted: false }),
        query
    )
        .search(['name', 'bnName'])
        .filter()
        .sort()
        .paginate()
        .fields();

    const result = await fetchQuery.modelQuery;
    const meta = await fetchQuery.countTotal();
    return { result, meta };
};

// get single category
const getSingleCategoryFromDB = async (id: string) => {
    const result = Category.findOne({ id, isDeleted: false });
    if (!result) {
        throw new AppError(httpStatus.NOT_FOUND, 'No Category Found');
    }
    return result;
};

// update category
const updateCategoryIntoDB = async (
    id: string,
    payload: Partial<ICategory>
) => {
    const result = Category.findOneAndUpdate(
        { id, isDeleted: false },
        payload,
        { new: true }
    );
    if (!result) {
        throw new AppError(httpStatus.NOT_FOUND, 'No Category Found');
    }
    return result;
};

// update category image
const updateCategoryImageIntoDB = async (
    id: string,
    file: Express.Multer.File
) => {
    const category = Category.findOne({ id, isDeleted: false });
    if (!category) {
        throw new AppError(httpStatus.NOT_FOUND, 'No Category Found');
    }

    // generate image name
    const imageName = generateImageName(id);

    // wait for cloudinary response
    const imageResponse = await sendImageToCloudinary(imageName, file?.path);
    const image = imageResponse?.secure_url;

    const result = await Category.findOneAndUpdate(
        { id },
        { image },
        { new: true }
    );
    return result;
};

// change category status
const changeCategoryStatusIntoDB = async (
    id: string,
    payload: { status: 'Active' | 'Disabled' }
) => {
    const category = Category.findOne({ id, isDeleted: false });
    if (!category) {
        throw new AppError(httpStatus.NOT_FOUND, 'No Category Found');
    }

    const result = await Category.findOneAndUpdate({ id }, payload, {
        new: true,
    });
    return result;
};

// delete category
const deleteCategoryFromDB = async (id: string) => {
    const category = Category.findOne({ id, isDeleted: false });
    if (!category) {
        throw new AppError(httpStatus.NOT_FOUND, 'No Category Found');
    }

    const result = await Category.findOneAndUpdate(
        { id },
        { isDeleted: true },
        { new: true }
    );
    return result;
};

export const CategoryServices = {
    createCategoryIntoDB,
    getAllCategoryFromDB,
    getSingleCategoryFromDB,
    updateCategoryIntoDB,
    updateCategoryImageIntoDB,
    changeCategoryStatusIntoDB,
    deleteCategoryFromDB,
};

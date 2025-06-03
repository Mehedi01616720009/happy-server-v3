import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { ITag } from './tag.interface';
import { Tag } from './tag.model';
import QueryBuilder from '../../builder/QueryBuilder';

// create tag
const createTagIntoDB = async (payload: ITag) => {
    const tag = await Tag.findOne({ value: payload.value, type: payload.type });
    if (tag) {
        throw new AppError(httpStatus.IM_USED, 'Tag Already Exist');
    }
    const result = await Tag.create(payload);
    return result;
};

// get all tag
const getAllTagFromDB = async (query: Record<string, unknown>) => {
    const fetchQuery = new QueryBuilder(Tag.find(), query)
        .search(['name'])
        .filter()
        .sort()
        .paginate()
        .fields();

    const result = await fetchQuery.modelQuery;
    const meta = await fetchQuery.countTotal();
    return { result, meta };
};

// get single tag
const getSingleTagFromDB = async (id: string) => {
    const result = Tag.findOne({ id });
    if (!result) {
        throw new AppError(httpStatus.NOT_FOUND, 'No Tag Found');
    }
    return result;
};

// update tag
const updateTagIntoDB = async (id: string, payload: Partial<ITag>) => {
    const tag = await Tag.findById(id);
    if (tag) {
        throw new AppError(httpStatus.NOT_FOUND, 'No Tag Found');
    }
    const result = await Tag.findByIdAndUpdate(id, payload, { new: true });
    return result;
};

export const TagServices = {
    createTagIntoDB,
    getAllTagFromDB,
    getSingleTagFromDB,
    updateTagIntoDB,
};

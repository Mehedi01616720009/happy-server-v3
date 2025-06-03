import QueryBuilder from '../../builder/QueryBuilder';
import { Union } from './union.model';

// get all union
const getAllUnionFromDB = async (query: Record<string, unknown>) => {
    const fetchQuery = new QueryBuilder(Union.find().populate('upazila'), query)
        .search(['name', 'bnName'])
        .filter()
        .sort()
        .paginate()
        .fields();

    const result = await fetchQuery.modelQuery;
    const meta = await fetchQuery.countTotal();
    return { result, meta };
};

// get single union
const getSingleUnionFromDB = async (id: string) => {
    const result = Union.findOne({ id });
    return result;
};

export const UnionServices = {
    getAllUnionFromDB,
    getSingleUnionFromDB,
};

import QueryBuilder from '../../builder/QueryBuilder';
import { Upazila } from './upazila.model';

// get all upazila
const getAllUpazilaFromDB = async (query: Record<string, unknown>) => {
    const fetchQuery = new QueryBuilder(Upazila.find(), query)
        .search(['name', 'bnName'])
        .filter()
        .sort()
        .paginate()
        .fields();

    const result = await fetchQuery.modelQuery;
    const meta = await fetchQuery.countTotal();
    return { result, meta };
};

// get single upazila
const getSingleUpazilaFromDB = async (id: string) => {
    const result = Upazila.findOne({ id });
    return result;
};

export const UpazilaServices = {
    getAllUpazilaFromDB,
    getSingleUpazilaFromDB,
};

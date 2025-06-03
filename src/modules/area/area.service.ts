import QueryBuilder from '../../builder/QueryBuilder';
import generateSlug from '../../utils/generateSlug';
import { IArea } from './area.interface';
import { Area } from './area.model';

// create Area
const createAreaIntoDB = async (payload: IArea) => {
    const areaData: IArea = {
        ...payload,
    };
    areaData.id = await generateSlug(payload.name);

    const result = await Area.create(areaData);
    return result;
};

// get all area
const getAllAreaFromDB = async (query: Record<string, unknown>) => {
    const fetchQuery = new QueryBuilder(Area.find().populate('union'), query)
        .search(['name', 'bnName'])
        .filter()
        .sort()
        .paginate()
        .fields();

    const result = await fetchQuery.modelQuery;
    const meta = await fetchQuery.countTotal();
    return { result, meta };
};

// get single area
const getSingleAreaFromDB = async (id: string) => {
    const result = Area.findOne({ id });
    return result;
};

// update Area
const updateAreaIntoDB = async (id: string, payload: Partial<IArea>) => {
    const result = await Area.findOneAndUpdate({ id }, payload, { new: true });
    return result;
};

export const AreaServices = {
    createAreaIntoDB,
    getAllAreaFromDB,
    getSingleAreaFromDB,
    updateAreaIntoDB,
};

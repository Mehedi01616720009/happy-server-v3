import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { Company } from '../company/company.model';
import { IDamage } from './damage.interface';
import { Damage } from './damage.model';
import { User } from '../user/user.model';
import QueryBuilder from '../../builder/QueryBuilder';
// create damage
const createDamageIntoDB = async (payload: IDamage) => {
    const company = await Company.findOne({
        id: payload.company,
        isDeleted: false,
    });
    if (!company) {
        throw new AppError(httpStatus.NOT_FOUND, 'No company found');
    }

    const dealer = await User.findOne({ id: payload.dealer, isDeleted: false });
    if (!dealer) {
        throw new AppError(httpStatus.NOT_FOUND, 'No dealer found');
    }

    const retailer = await User.findOne({
        id: payload.retailer,
        isDeleted: false,
    });
    if (!retailer) {
        throw new AppError(httpStatus.NOT_FOUND, 'No retailer found');
    }

    const dsr = await User.findOne({ id: payload.dsr, isDeleted: false });
    if (!dsr) {
        throw new AppError(httpStatus.NOT_FOUND, 'No dsr found');
    }

    const damageData: IDamage = {
        company: company._id,
        dealer: dealer._id,
        retailer: retailer._id,
        dsr: dsr._id,
        note: payload.note,
        amount: payload.amount,
        reason: payload.reason,
    };

    const result = await Damage.create(damageData);
    return result;
};

// get all damage
const getAllDamageFromDB = async (query: Record<string, unknown>) => {
    const fetchQuery = new QueryBuilder(
        Damage.find()
            .populate('company')
            .populate('dealer')
            .populate('retailer')
            .populate('dsr'),
        query
    )
        .filter()
        .sort()
        .paginate()
        .fields();

    const result = await fetchQuery.modelQuery;
    const meta = await fetchQuery.countTotal();
    return { result, meta };
};

export const DamageServices = {
    createDamageIntoDB,
    getAllDamageFromDB,
};

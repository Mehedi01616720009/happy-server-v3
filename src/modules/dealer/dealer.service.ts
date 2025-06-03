import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { User } from '../user/user.model';
import { Dealer } from './dealer.model';
import { Types } from 'mongoose';
import QueryBuilder from '../../builder/QueryBuilder';
import { Sr } from '../sr/sr.model';
import { Product } from '../product/product.model';

// get all dealer
const getAllDealerFromDB = async (query: Record<string, unknown>) => {
    const fetchQuery = new QueryBuilder(
        Dealer.find().populate('dealer').populate('companies'),
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

// get all dealer by user
const getAllDealerByUserFromDB = async (query: Record<string, unknown>) => {
    const fetchQuery = new QueryBuilder(User.find({ role: 'dealer' }), query)
        .search(['name', 'phone'])
        .filter()
        .sort()
        .paginate()
        .fields();

    const dealers = await fetchQuery.modelQuery;
    const result = await Promise.all(
        dealers.map(async dealer => {
            const productCount = await Product.countDocuments({
                dealer: dealer._id,
            });

            return {
                ...dealer.toObject(),
                productCount,
            };
        })
    );
    const meta = await fetchQuery.countTotal();
    return { result, meta };
};

// get all dealer with sr and product count
const getAllDealerWithSrAndProductFromDB = async (
    query: Record<string, unknown>
) => {
    const fetchQuery = new QueryBuilder(
        Dealer.find().populate('dealer').populate('companies'),
        query
    )
        .filter()
        .sort()
        .paginate()
        .fields();

    const result = await fetchQuery.modelQuery;
    const meta = await fetchQuery.countTotal();

    if (result?.length > 0) {
        const dealersWithCounts = await Promise.all(
            result.map(async dealer => {
                const srCount = await Sr.countDocuments({
                    dealers: { $in: [dealer.dealer._id] },
                });

                const productCount = await Product.countDocuments({
                    dealer: new Types.ObjectId(dealer.dealer._id),
                });

                return {
                    ...dealer.toObject(),
                    srCount,
                    productCount,
                };
            })
        );

        return {
            result: dealersWithCounts,
            meta,
        };
    }

    return { result, meta };
};

// get single dealer
const getSingleDealerFromDB = async (id: string) => {
    const user = await User.findOne({ id, status: 'Active', isDeleted: false });
    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, 'No Dealer Found');
    }

    const result = Dealer.findOne({ dealer: user._id })
        .populate('dealer')
        .populate('companies');
    return result;
};

// get single dealer with sr and product
const getSingleDealerWithSrAndProductFromDB = async (id: string) => {
    // Find the user first
    const user = await User.findOne({ id, status: 'Active', isDeleted: false });
    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, 'No Dealer Found');
    }

    const dealer = await Dealer.findOne({ dealer: user._id })
        .populate('dealer')
        .populate('companies');

    if (!dealer) {
        throw new AppError(httpStatus.NOT_FOUND, 'No Dealer Found');
    }

    const srCount = await Sr.countDocuments({
        dealers: { $in: [user._id] },
    });

    const productCount = await Product.countDocuments({
        dealer: new Types.ObjectId(user._id),
    });

    return {
        ...dealer.toObject(),
        srCount,
        productCount,
    };
};

// assign companies to dealer
const assignCompaniesToDealerIntoDB = async (
    id: string,
    payload: { companies: Types.ObjectId[] }
) => {
    const user = await User.findOne({ id, status: 'Active', isDeleted: false });
    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, 'No Dealer Found');
    }

    const dealerInfoData: {
        dealer: Types.ObjectId;
        companies: Types.ObjectId[];
    } = {
        dealer: user?._id,
        ...payload,
    };

    const result = await Dealer.findOneAndUpdate(
        { dealer: user?._id },
        dealerInfoData,
        { new: true }
    );
    return result;
};

export const DealerServices = {
    getAllDealerFromDB,
    getAllDealerByUserFromDB,
    getAllDealerWithSrAndProductFromDB,
    getSingleDealerFromDB,
    getSingleDealerWithSrAndProductFromDB,
    assignCompaniesToDealerIntoDB,
};

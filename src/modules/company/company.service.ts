import httpStatus from 'http-status';
import QueryBuilder from '../../builder/QueryBuilder';
import AppError from '../../errors/AppError';
import generateImageName from '../../utils/generateImageName';
import generateSlug from '../../utils/generateSlug';
import { sendImageToCloudinary } from '../../utils/sendImageToCloudinary';
import { ICompany } from './company.interface';
import { Company } from './company.model';

// create company
const createCompanyIntoDB = async (
    file: Express.Multer.File,
    payload: ICompany
) => {
    const companyData: ICompany = {
        ...payload,
    };
    companyData.id = await generateSlug(payload.name);

    if (file?.path) {
        // generate image name
        const imageName = generateImageName(companyData.id);

        // wait for cloudinary response
        const image = await sendImageToCloudinary(imageName, file?.path);
        companyData.image = image?.secure_url;
    }

    const result = await Company.create(companyData);
    return result;
};

// get all company
const getAllCompanyFromDB = async (query: Record<string, unknown>) => {
    const fetchQuery = new QueryBuilder(
        Company.find({ isDeleted: false }),
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

// get single company
const getSingleCompanyFromDB = async (id: string) => {
    const result = Company.findOne({ id, isDeleted: false });
    if (!result) {
        throw new AppError(httpStatus.NOT_FOUND, 'No Category Found');
    }
    return result;
};

// update company
const updateCompanyIntoDB = async (id: string, payload: Partial<ICompany>) => {
    const result = Company.findOneAndUpdate({ id, isDeleted: false }, payload, {
        new: true,
    });
    if (!result) {
        throw new AppError(httpStatus.NOT_FOUND, 'No Company Found');
    }
    return result;
};

// update company image
const updateCompanyImageIntoDB = async (
    id: string,
    file: Express.Multer.File
) => {
    const company = Company.findOne({ id, isDeleted: false });
    if (!company) {
        throw new AppError(httpStatus.NOT_FOUND, 'No Company Found');
    }

    // generate image name
    const imageName = generateImageName(id);

    // wait for cloudinary response
    const imageResponse = await sendImageToCloudinary(imageName, file?.path);
    const image = imageResponse?.secure_url;

    const result = await Company.findOneAndUpdate(
        { id },
        { image },
        { new: true }
    );
    return result;
};

// change company status
const changeCompanyStatusIntoDB = async (
    id: string,
    payload: { status: 'Active' | 'Disabled' }
) => {
    const company = Company.findOne({ id, isDeleted: false });
    if (!company) {
        throw new AppError(httpStatus.NOT_FOUND, 'No Company Found');
    }

    const result = await Company.findOneAndUpdate({ id }, payload, {
        new: true,
    });
    return result;
};

// delete company
const deleteCompanyFromDB = async (id: string) => {
    const company = Company.findOne({ id, isDeleted: false });
    if (!company) {
        throw new AppError(httpStatus.NOT_FOUND, 'No Company Found');
    }

    const result = await Company.findOneAndUpdate(
        { id },
        { isDeleted: true },
        { new: true }
    );
    return result;
};

export const CompanyServices = {
    createCompanyIntoDB,
    getAllCompanyFromDB,
    getSingleCompanyFromDB,
    updateCompanyIntoDB,
    updateCompanyImageIntoDB,
    changeCompanyStatusIntoDB,
    deleteCompanyFromDB,
};

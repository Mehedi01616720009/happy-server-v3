import { Model } from 'mongoose';

// company interface
export interface ICompany {
    id: string;
    name: string;
    bnName: string;
    image: string;
    status: 'Active' | 'Disabled';
    isDeleted: boolean;
}

// company model interface
export interface ICompanyModel extends Model<ICompany> {
    isCompanyExistById(id: string): ICompany;
}

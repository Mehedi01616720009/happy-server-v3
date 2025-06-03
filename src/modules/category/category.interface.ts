import { Model } from 'mongoose';

// category interface
export interface ICategory {
    id: string;
    name: string;
    bnName: string;
    image: string;
    status: 'Active' | 'Disabled';
    isDeleted: boolean;
}

// category model interface
export interface ICategoryModel extends Model<ICategory> {
    isCategoryExistById(id: string): ICategory;
}

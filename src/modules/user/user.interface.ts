import { Model } from 'mongoose';
import { USER_ROLES } from './user.constant';

// user role type
export type TUserRole = keyof typeof USER_ROLES;

// user interface
export interface IUser {
    id: string;
    name: string;
    phone: string;
    nid?: string;
    password: string;
    needPasswordChange: boolean;
    role: TUserRole;
    status: 'Active' | 'Blocked';
    profileImg?: string;
    isDeleted: boolean;
    createdAt: string;
    updatedAt: string;
    insertedDate: Date;
}

// user model interface
export interface IUserModel extends Model<IUser> {
    isUserExistById(id: string): IUser;
    isUserExistByPhone(phone: string): IUser;
    isPasswordMatched(plainPassword: string, hashedPassword: string): boolean;
}

export interface IChangePassword {
    oldPassword: string;
    newPassword: string;
}

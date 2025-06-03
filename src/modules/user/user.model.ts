import { USER_ROLES_ARRAY } from './user.constant';
import { IUser, IUserModel } from './user.interface';
import { model, Schema } from 'mongoose';
import bcrypt from 'bcrypt';
import moment from 'moment-timezone';
import { TIMEZONE } from '../../constant';

// user schema
const userSchema = new Schema<IUser>({
    id: {
        type: String,
        required: [true, 'User ID is required'],
        unique: true,
    },
    name: {
        type: String,
        required: [true, 'Name is required'],
    },
    phone: {
        type: String,
        required: [true, 'Phone is required'],
        unique: true,
    },
    nid: {
        type: String,
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        select: 0,
    },
    needPasswordChange: {
        type: Boolean,
        default: true,
    },
    role: {
        type: String,
        enum: {
            values: [...USER_ROLES_ARRAY],
            message: '{VALUE} is invalid role',
        },
        required: [true, 'Role is required'],
    },
    status: {
        type: String,
        enum: {
            values: ['Active', 'Blocked'],
            message: '{VALUE} is invalid status',
        },
        default: 'Active',
    },
    profileImg: {
        type: String,
        required: [true, 'Profile Image is required'],
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },
    createdAt: {
        type: String,
        default: () => moment().tz(TIMEZONE).format(),
    },
    updatedAt: {
        type: String,
        default: () => moment().tz(TIMEZONE).format(),
    },
    insertedDate: {
        type: Date,
        default: () => moment().tz(TIMEZONE).toDate(),
    },
});

// user model static function (isUserExistById)
userSchema.statics.isUserExistById = async function (id: string) {
    return await User.findOne({ id });
};

// user model static function (isUserExistByPhone)
userSchema.statics.isUserExistByPhone = async function (phone: string) {
    return await User.findOne({ phone });
};

// user model static function (isPasswordMatched)
userSchema.statics.isPasswordMatched = async function (
    plainPassword: string,
    hashedPassword: string
) {
    return await bcrypt.compare(plainPassword, hashedPassword);
};

// user model
export const User = model<IUser, IUserModel>('User', userSchema);

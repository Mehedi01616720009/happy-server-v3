import config from '../config';
import { IUser } from '../modules/user/user.interface';
import { USER_ROLES } from '../modules/user/user.constant';
import { User } from '../modules/user/user.model';
import AppError from '../errors/AppError';
import httpStatus from 'http-status';
import generateUserId from '../utils/generateUserId';
import bcrypt from 'bcrypt';

// super admin data
const superAdminData: Partial<IUser> = {
    name: 'Mehedi Hasan',
    phone: '01616720009',
    password: config.superAdminPassword as string,
    needPasswordChange: false,
    role: USER_ROLES.superAdmin,
    status: 'Active',
    profileImg: config.profileImg,
};

// super admin query
const superAdminQuery = { role: USER_ROLES.superAdmin };

const seedSuperAdmin = async () => {
    // check count of super admins, if it grater than limit of super admin delete all and initialize it
    const totalSuperAdmins = await User.countDocuments(superAdminQuery);
    if (totalSuperAdmins > Number(config.superAdminLimit)) {
        await User.deleteMany(superAdminQuery);
    }
    // check if any super admin exist, if no one then seed super admin
    const isSuperAdminExist = await User.findOne(superAdminQuery);
    if (!isSuperAdminExist) {
        const isUserExist = await User.isUserExistByPhone(
            superAdminData?.phone as string
        );
        if (isUserExist?.phone) {
            throw new AppError(
                httpStatus.IM_USED,
                'This email has already exist'
            );
        }
        superAdminData.id = await generateUserId(
            superAdminData?.name as string,
            superAdminData.phone as string
        );
        superAdminData.password = await bcrypt.hash(
            superAdminData.password as string,
            Number(config.bcryptSaltRounds)
        );
        superAdminData.profileImg = config.profileImg as string;
        await User.create(superAdminData);
    }
};

export default seedSuperAdmin;

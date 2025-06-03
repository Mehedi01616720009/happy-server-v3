import dotenv from 'dotenv';
import path from 'path';

// .env connection
dotenv.config({ path: path.join((process.cwd(), '.env')) });

// env variables
export default {
    nodeEnv: process.env.NODE_ENV,
    port: process.env.PORT,
    databaseUrl:
        process.env.NODE_ENV === 'production'
            ? process.env.DATABASE_URL
            : process.env.LOCAL_DATABASE_URL,
    companyName: process.env.COMPANY_NAME,
    accessSecret: process.env.ACCESS_TOKEN_SECRET,
    refreshSecret: process.env.REFRESH_TOKEN_SECRET,
    accessTokenExp: process.env.ACCESS_TOKEN_EXP,
    refreshTokenExp: process.env.REFRESH_TOKEN_EXP,
    bcryptSaltRounds: process.env.BCRYPT_SALT_ROUNDS,
    profileImg: process.env.PROFILE_IMG,
    defaultPassword: process.env.DEFAULT_PASSWORD,
    superAdminPassword: process.env.SUPER_ADMIN_PASSWORD,
    superAdminLimit: process.env.SUPER_ADMIN_LIMIT,
    mailHostName: process.env.MAIL_HOSTNAME,
    mailPort: process.env.MAIL_PORT,
    mailUser: process.env.MAIL_USER,
    mailPassword: process.env.MAIL_PASSWORD,
    cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME,
    cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
    cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET,
    frontendUrl: process.env.FRONTEND_BASE_URL,
};

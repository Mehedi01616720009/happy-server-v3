import bcrypt from 'bcrypt';
import config from '../config';

const passwordHash = async (password: string) => {
    const hashedPassword = await bcrypt.hash(
        password as string,
        Number(config.bcryptSaltRounds)
    );

    return hashedPassword;
};

export default passwordHash;

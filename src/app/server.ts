import { Server } from 'http';
import mongoose from 'mongoose';
import config from '../config';
import app from './app';
import seedSuperAdmin from '../DB';
import { seedUpazilas } from '../DB/seedUpazilas';
import { seedUnions } from '../DB/seedUnions';
import { seedAreas } from '../DB/seedAreas';

// server initialization
let server: Server;

async function main() {
    try {
        // database connection
        await mongoose.connect(config.databaseUrl as string);

        // check and seed super admin
        await seedSuperAdmin();

        // seed upazilas
        await seedUpazilas();

        // seed unions
        await seedUnions();

        // seed areas
        await seedAreas();

        // server initial port listener
        server = app.listen(config.port, () => {
            console.log({ message: `Server is listening on ${config.port}` });
        });
    } catch (err: any) {
        console.log({
            success: false,
            message: 'Internal server error',
            errorMessages: {
                path: '/',
                message: err?.message,
            },
            stack: err,
        });
    }
}

main();

// server unhandled rejection listener
process.on('unhandledRejection', () => {
    console.log({ message: '--| Unhandled Rejection Detected |--' });

    if (server) {
        server.close(() => {
            process.exit(1);
        });
    }
    process.exit(1);
});

// server uncaught exception listener
process.on('uncaughtException', () => {
    console.log({ message: '--| Uncaught Exception Detected |--' });
    process.exit(1);
});

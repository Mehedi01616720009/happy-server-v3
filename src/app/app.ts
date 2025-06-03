import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import httpStatus from 'http-status';
import router from '../routes';
import notFound from '../middlewares/notFound';
import globalErrorHandler from '../middlewares/globalErrorHandler';
import cookieParser from 'cookie-parser';
import config from '../config';
import moment from 'moment-timezone';
import { TIMEZONE } from '../constant';

// initialize express application
const app: Application = express();

// cross origin resources
app.use(cors({ origin: [config.frontendUrl as string], credentials: true }));

// cookie parser
app.use(cookieParser());

// express parser
app.use(express.json());

// initial route
app.get('/', (req: Request, res: Response) => {
    res.status(httpStatus.OK).json({
        success: true,
        message: 'Server is running successfully',
        data: moment().tz(TIMEZONE).format(),
    });
});

// application routes
app.use('/api/v2', router);

// global error handler
app.use(globalErrorHandler);

// not found api
app.use(notFound);

export default app;

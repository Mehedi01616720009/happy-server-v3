import { z } from 'zod';
import { DAYS } from './userRoute.constant';

// create user route validation
const createUserRouteValidationSchema = z.object({
    body: z.object({
        day: z.enum([...DAYS], {
            message: 'Day is invalid',
        }),
        routes: z.array(z.string()).nonempty({
            message: 'At least one area is required',
        }),
    }),
});

// create sr route day validation
const createSrRouteDayValidationSchema = z.object({
    body: z.object({
        date: z.string().date('Invalid date string!'),
        routes: z.array(z.string()).nonempty({
            message: 'At least one area is required',
        }),
    }),
});

// delete user route validation
const deleteUserRouteValidationSchema = z.object({
    body: z.object({
        day: z.enum([...DAYS], {
            message: 'Day is invalid',
        }),
        route: z.string({
            required_error: 'A route is required',
        }),
    }),
});

export const UserRouteValidations = {
    createUserRouteValidationSchema,
    createSrRouteDayValidationSchema,
    deleteUserRouteValidationSchema,
};

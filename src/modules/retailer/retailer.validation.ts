import { z } from 'zod';
import config from '../../config';

// location validation
const locationValidationSchema = z.object({
    latitude: z.number({
        required_error: 'Latitude is required',
    }),
    longitude: z.number({
        required_error: 'Longitude is required',
    }),
});

// create retailer validation
const createRetailerValidationSchema = z.object({
    body: z.object({
        role: z.enum(['retailer'], {
            message: 'Role is invalid',
        }),
        shopName: z
            .string({
                required_error: 'Shop name is required',
            })
            .min(1, { message: 'Shop name cannot be empty' }),
        union: z
            .string({
                required_error: 'Union is required',
            })
            .min(1, { message: 'Union cannot be empty' }),
        area: z
            .string({
                required_error: 'Area is required',
            })
            .min(1, { message: 'Area cannot be empty' }),
        location: locationValidationSchema,
        profileImg: z.string().default(config.profileImg as string),
    }),
});

// update retailer validation
const updateRetailerValidationSchema = z.object({
    body: z.object({
        name: z.string().optional(),
        phone: z.string().optional(),
        shopName: z.string().optional(),
        union: z.string().optional(),
        area: z.string().optional(),
        environment: z.string().optional(),
        location: locationValidationSchema.optional(),
    }),
});

export const RetailerValidations = {
    createRetailerValidationSchema,
    updateRetailerValidationSchema,
};

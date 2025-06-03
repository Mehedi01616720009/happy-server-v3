import { z } from 'zod';

// create area validation
const createAreaValidationSchema = z.object({
    body: z.object({
        union: z
            .string({
                required_error: 'Union is required',
            })
            .min(1, { message: 'Union cannot be empty' }),
        name: z
            .string({
                required_error: 'Name is required',
            })
            .min(1, { message: 'Name cannot be empty' }),
        bnName: z
            .string({
                required_error: 'Bangla Name is required',
            })
            .min(1, { message: 'Bangla Name cannot be empty' }),
    }),
});

// update area validation
const updateAreaValidationSchema = z.object({
    body: z.object({
        union: z.string().optional(),
        name: z.string().optional(),
        bnName: z.string().optional(),
    }),
});

export const AreaValidations = {
    createAreaValidationSchema,
    updateAreaValidationSchema,
};

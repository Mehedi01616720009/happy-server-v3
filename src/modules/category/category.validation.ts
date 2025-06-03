import { z } from 'zod';

// create category validation
const createCategoryValidationSchema = z.object({
    body: z.object({
        name: z
            .string({
                required_error: 'Name is required',
            })
            .min(1, { message: 'Name cannot be empty' }),
        bnName: z
            .string({
                required_error: 'Bangla name is required',
            })
            .min(1, { message: 'Bangla Name cannot be empty' }),
    }),
});

// update category validation
const updateCategoryValidationSchema = z.object({
    body: z.object({
        name: z.string().optional(),
        bnName: z.string().optional(),
    }),
});

// update category status validation
const updateCategoryStatusValidationSchema = z.object({
    body: z.object({
        status: z.enum(['Active', 'Disabled'], {
            message: 'Status is invalid',
        }),
    }),
});

export const CategoryValidations = {
    createCategoryValidationSchema,
    updateCategoryValidationSchema,
    updateCategoryStatusValidationSchema,
};

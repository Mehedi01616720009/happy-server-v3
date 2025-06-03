import { z } from 'zod';

// create company validation
const createCompanyValidationSchema = z.object({
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

// update company validation
const updateCompanyValidationSchema = z.object({
    body: z.object({
        name: z.string().optional(),
        bnName: z.string().optional(),
    }),
});

// update company status validation
const updateCompanyStatusValidationSchema = z.object({
    body: z.object({
        status: z.enum(['Active', 'Disabled'], {
            message: 'Status is invalid',
        }),
    }),
});

export const CompanyValidations = {
    createCompanyValidationSchema,
    updateCompanyValidationSchema,
    updateCompanyStatusValidationSchema,
};

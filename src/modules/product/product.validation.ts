import { z } from 'zod';

// create product validation
const createProductValidationSchema = z.object({
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
        category: z
            .string({
                required_error: 'Category is required',
            })
            .min(1, { message: 'Category cannot be empty' }),
        company: z
            .string({
                required_error: 'Company is required',
            })
            .min(1, { message: 'Company cannot be empty' }),
        dealer: z
            .string({
                required_error: 'Dealer is required',
            })
            .min(1, { message: 'Dealer cannot be empty' }),
        packageType: z
            .string({
                required_error: 'Package type is required',
            })
            .min(1, { message: 'Package type cannot be empty' }),
        quantityPerPackage: z.number({
            required_error: 'Quantity is required',
        }),
        stock: z.number().optional(),
        price: z.number({
            required_error: 'Price is required',
        }),
        dealerCommission: z.number({
            required_error: 'Dealer commission is required',
        }),
        ourCommission: z.number({
            required_error: 'Our commission is required',
        }),
        status: z
            .enum(['Active', 'Disabled'], {
                message: 'Status is invalid',
            })
            .default('Active'),
        tags: z.array(z.string()),
    }),
});

// update product validation
const updateProductValidationSchema = z.object({
    body: z.object({
        name: z.string().optional(),
        bnName: z.string().optional(),
        category: z.string().optional(),
        company: z.string().optional(),
        dealer: z.string().optional(),
        packageType: z.string().optional(),
        quantityPerPackage: z.number().optional(),
        stock: z.number().optional(),
        price: z.number().optional(),
        dealerCommission: z.number().optional(),
        ourCommission: z.number().optional(),
        status: z
            .enum(['Active', 'Disabled'], {
                message: 'Status is invalid',
            })
            .optional(),
        tags: z.array(z.string()).optional(),
    }),
});

export const ProductValidations = {
    createProductValidationSchema,
    updateProductValidationSchema,
};

import { z } from 'zod';

// create in product validation
const createInProductValidationSchema = z.object({
    body: z.object({
        dsr: z
            .string({
                required_error: 'Dsr is required',
            })
            .min(1, { message: 'Dsr cannot be empty' }),
        warehouse: z
            .string({
                required_error: 'Warehouse is required',
            })
            .min(1, { message: 'Warehouse cannot be empty' }),
        product: z
            .string({
                required_error: 'Product is required',
            })
            .min(1, { message: 'Product cannot be empty' }),
        quantity: z.number({
            required_error: 'Quantity is required',
        }),
    }),
});

export const InProductValidations = {
    createInProductValidationSchema,
};

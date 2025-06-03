import { z } from 'zod';

// create Warehouse validation
const createWarehouseValidationSchema = z.object({
    body: z.object({
        name: z
            .string({
                required_error: 'Name is required',
            })
            .min(1, { message: 'Name cannot be empty' }),
        adress: z
            .string({
                required_error: 'Adress is required',
            })
            .min(1, { message: 'Adress cannot be empty' }),
    }),
});

// update Warehouse validation
const updateWarehouseValidationSchema = z.object({
    body: z.object({
        name: z.string().optional(),
        adress: z.string().optional(),
    }),
});

export const WarehouseValidations = {
    createWarehouseValidationSchema,
    updateWarehouseValidationSchema,
};

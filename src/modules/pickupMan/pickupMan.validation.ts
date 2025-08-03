import { z } from 'zod';

// create picked product validation
const createPickedProductValidationSchema = z.object({
    body: z.object({
        dealer: z
            .string({
                required_error: 'Dealer is required',
            })
            .min(1, { message: 'Dealer cannot be empty' }),
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
        prevQuantity: z.number({
            required_error: 'Previous Quantity is required',
        }),
        newQuantity: z.number({
            required_error: 'New Quantity is required',
        }),
        quantity: z.number({
            required_error: 'Quantity is required',
        }),
        price: z.number({
            required_error: 'Price is required',
        }),
    }),
});

// assign warehouse validation
const assignWarehouseValidationSchema = z.object({
    body: z.object({
        warehouse: z
            .string({
                required_error: 'Warehouse is required',
            })
            .min(1, { message: 'Warehouse cannot be empty' }),
    }),
});

// create picked product validation
const updatePickedProductValidationSchema = z.object({
    body: z.object({
        quantity: z.number().optional(),
        price: z.number().optional(),
    }),
});

export const PickupManValidations = {
    createPickedProductValidationSchema,
    assignWarehouseValidationSchema,
    updatePickedProductValidationSchema,
};

import { z } from 'zod';

const inventoryValidationSchema = z.object({
    body: z.object({
        packingman: z.string({ required_error: 'Packingman is required' }),
        dsr: z.string({ required_error: 'Deliveryman is required' }),
        warehouse: z.string({ required_error: 'Warehouse is required' }),
        product: z.string({ required_error: 'Product is required' }),
        outQuantity: z.number().int().nonnegative(),
    }),
});

const updateInventoryValidationSchema = z.object({
    body: z.object({
        dsr: z.string({ required_error: 'Deliveryman is required' }),
        warehouse: z.string({ required_error: 'Warehouse is required' }),
        product: z.string({ required_error: 'Product is required' }),
    }),
});

export const InventoryValidations = {
    inventoryValidationSchema,
    updateInventoryValidationSchema,
};

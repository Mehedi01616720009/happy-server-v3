import { z } from 'zod';

const inventoryValidationSchema = z.object({
    packingman: z.string({ required_error: 'Packingman is required' }),
    dsr: z.string({ required_error: 'Deliveryman is required' }),
    warehouse: z.string({ required_error: 'Warehouse is required' }),
    product: z.string({ required_error: 'Product is required' }),
    outQuantity: z.number().int().nonnegative(),
});

export const InventoryValidations = { inventoryValidationSchema };

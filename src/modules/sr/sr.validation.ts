import { z } from 'zod';

// update sr info validation
const updateSrInfoValidationSchema = z.object({
    body: z.object({
        dealers: z.array(z.string()).optional(),
        companies: z.array(z.string()).optional(),
        upazilas: z.array(z.string()).optional(),
        warehouse: z.string().optional(),
    }),
});

export const SrValidations = {
    updateSrInfoValidationSchema,
};

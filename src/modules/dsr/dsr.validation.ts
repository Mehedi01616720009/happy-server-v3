import { z } from 'zod';

// assign data to dsr info validation
const assignDataToDsrValidationSchema = z.object({
    body: z.object({
        upazilas: z.array(z.string()).optional(),
        sr: z.array(z.string()).optional(),
    }),
});

export const DsrValidations = {
    assignDataToDsrValidationSchema,
};

import { z } from 'zod';

// assign upazilas to dsr info validation
const assignUpazilasToDsrValidationSchema = z.object({
    body: z.object({
        upazilas: z.array(z.string()).nonempty({
            message: 'Upazilas is required',
        }),
    }),
});

export const DsrValidations = {
    assignUpazilasToDsrValidationSchema,
};

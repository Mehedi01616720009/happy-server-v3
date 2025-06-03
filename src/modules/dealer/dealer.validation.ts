import { z } from 'zod';

// assign companies to dealer info validation
const assignCompaniesToDealerValidationSchema = z.object({
    body: z.object({
        companies: z.array(z.string()).nonempty({
            message: 'Company is required',
        }),
    }),
});

export const DealerValidations = {
    assignCompaniesToDealerValidationSchema,
};

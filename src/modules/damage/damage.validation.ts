import { z } from 'zod';

const createDamageValidationSchema = z.object({
    body: z.object({
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
        retailer: z
            .string({
                required_error: 'Retailer is required',
            })
            .min(1, { message: 'Retailer cannot be empty' }),
        dsr: z
            .string({
                required_error: 'Dsr is required',
            })
            .min(1, { message: 'Dsr cannot be empty' }),
        note: z
            .string({
                required_error: 'Note is required',
            })
            .min(1, { message: 'Note cannot be empty' }),
        amount: z.number({
            required_error: 'Amount is required',
        }),
        reason: z
            .string({
                required_error: 'Reason is required',
            })
            .min(1, { message: 'Reason cannot be empty' }),
    }),
});

export const DamageValidations = {
    createDamageValidationSchema,
};

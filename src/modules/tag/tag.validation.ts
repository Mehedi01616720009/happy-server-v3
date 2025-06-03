import { z } from 'zod';

// create tag validation
const createTagValidationSchema = z.object({
    body: z.object({
        name: z
            .string({
                required_error: 'Name is required',
            })
            .min(1, { message: 'Name cannot be empty' }),
        value: z
            .number({
                required_error: 'Value is required',
            })
            .gt(0, { message: 'Value cannot be zero' }),
        type: z.enum(['box', 'peice'], {
            message: 'Type is invalid',
        }),
    }),
});

// update tag validation
const updateTagValidationSchema = z.object({
    body: z.object({
        name: z.string().optional(),
        value: z.number().optional(),
        type: z
            .enum(['box', 'peice'], {
                message: 'Type is invalid',
            })
            .optional(),
    }),
});

export const TagValidations = {
    createTagValidationSchema,
    updateTagValidationSchema,
};

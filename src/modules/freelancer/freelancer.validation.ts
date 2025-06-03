import { z } from 'zod';

// assign upazilas to freelancer info validation
const assignUpazilasToFreelancerValidationSchema = z.object({
    body: z.object({
        upazilas: z.array(z.string()).nonempty({
            message: 'Upazilas is required',
        }),
    }),
});

// update freelancer work validation
const updateFreelancerWorkValidationSchema = z.object({
    body: z.object({
        addedBy: z.string().optional(),
        editedBy: z.string().optional(),
    }),
});

export const FreelancerValidations = {
    assignUpazilasToFreelancerValidationSchema,
    updateFreelancerWorkValidationSchema,
};

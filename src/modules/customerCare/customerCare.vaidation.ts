import { z } from 'zod';

// create customer care data validation
const createCustomerCareDataValidationSchema = z.object({
    body: z.object({
        order: z
            .string({
                required_error: 'Order is required',
            })
            .min(1, { message: 'Order cannot be empty' }),
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
        requestType: z.enum(['Pending', 'Baki'], {
            message: 'Request Type is invalid',
        }),
        pendingReason: z.string().optional(),
        requestDate: z.string().date().optional(),
    }),
});

// update not interest customer care data validation
const updateNotInterestCustomerCareDataValidationSchema = z.object({
    body: z.object({
        status: z.enum(['Not Interest'], {
            message: 'Status is invalid',
        }),
        notInterestReason: z
            .string({
                required_error: 'Reason is required',
            })
            .min(1, { message: 'Reason cannot be empty' }),
    }),
});

// update interest customer care data validation
const updateInterestCustomerCareDataValidationSchema = z.object({
    body: z.object({
        status: z.enum(['Interest'], {
            message: 'Status is invalid',
        }),
        requestDate: z
            .string({
                required_error: 'Request Date is required',
            })
            .date('Request Date must be a date'),
    }),
});

export const CustomerCareDataValidations = {
    createCustomerCareDataValidationSchema,
    updateNotInterestCustomerCareDataValidationSchema,
    updateInterestCustomerCareDataValidationSchema,
};

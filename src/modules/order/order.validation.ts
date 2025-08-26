import { z } from 'zod';

// create order details validation
const createOrderDetailsValidationSchema = z.object({
    product: z
        .string({
            required_error: 'Product ID is required',
        })
        .min(1, { message: 'Product ID be empty' }),
    quantity: z.number({
        required_error: 'Quantity is required',
    }),
    price: z.number({
        required_error: 'Price is required',
    }),
    totalAmount: z.number({
        required_error: 'Total amount is required',
    }),
    srPrice: z.number().optional(),
    srTotalAmount: z.number().optional(),
});

const updateOrderDetailsValidationSchema = z.object({
    product: z
        .string({
            required_error: 'Product ID is required',
        })
        .min(1, { message: 'Product ID be empty' }),
    quantity: z.number({
        required_error: 'Quantity is required',
    }),
    totalAmount: z.number({
        required_error: 'Total amount is required',
    }),
    dealerTotalAmount: z.number({
        required_error: 'Dealer amount is required',
    }),
    srTotalAmount: z.number({
        required_error: 'Sr amount is required',
    }),
});

// create order validation
const createOrderValidationSchema = z.object({
    body: z.object({
        retailer: z
            .string({
                required_error: 'Retailer ID is required',
            })
            .min(1, { message: 'Retailer ID cannot be empty' }),
        area: z
            .string({
                required_error: 'Area is required',
            })
            .min(1, { message: 'Area cannot be empty' }),
        dealer: z
            .string({
                required_error: 'Dealer ID is required',
            })
            .min(1, { message: 'Dealer cannot be empty' }),
        sr: z.string().optional(),
        dsr: z.string().optional(),
        collectionAmount: z.number({
            required_error: 'Collection Amount is required',
        }),
        collectedAmount: z.number().optional(),
        status: z
            .enum(['Baki', 'Delivered'], {
                message: 'Status is invalid',
            })
            .optional(),
        paymentStatus: z
            .enum(['Paid', 'Unpaid', 'Partial Paid'], {
                message: 'Payment Status is invalid',
            })
            .optional(),
        products: z.array(createOrderDetailsValidationSchema),
    }),
});

// update order product validation
const updateOrderProductValidationSchema = z.object({
    body: z.object({
        quantity: z.number({
            required_error: 'Quantity is required',
        }),
        srPrice: z.number({
            required_error: 'Price is required',
        }),
    }),
});

// cancel order validation
const cancelOrderValidationSchema = z.object({
    body: z.object({
        cancelledReason: z.string({
            required_error: 'Cancelled reason is required',
        }),
    }),
});

// cancel order product validation
const cancelOrderProductValidationSchema = z.object({
    body: z.object({
        cancelledReason: z.string({
            required_error: 'Cancelled reason is required',
        }),
    }),
});

// dispatch order validation
const dispatchOrderValidationSchema = z.object({
    body: z.object({
        dsr: z.string({
            required_error: 'Dsr is required',
        }),
    }),
});

// deliver order validation
const deliverOrderValidationSchema = z.object({
    body: z.object({
        collectionAmount: z.number({
            required_error: 'Collection Amount is required',
        }),
        collectedAmount: z.number({
            required_error: 'Collected Amount is required',
        }),
        products: z.array(updateOrderDetailsValidationSchema),
    }),
});

// delete order validation
const deleteOrderValidationSchema = z.object({
    body: z.object({
        id: z.array(
            z.string({
                required_error: 'A order is required',
            })
        ),
    }),
});

export const OrderValidations = {
    createOrderValidationSchema,
    updateOrderProductValidationSchema,
    cancelOrderValidationSchema,
    cancelOrderProductValidationSchema,
    dispatchOrderValidationSchema,
    deliverOrderValidationSchema,
    deleteOrderValidationSchema,
};

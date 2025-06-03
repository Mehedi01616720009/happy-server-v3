import { z } from 'zod';
import { USER_ROLES_ARRAY } from './user.constant';

// create user validation
const createUserValidationSchema = z.object({
    body: z.object({
        name: z
            .string({
                required_error: 'Name is required',
            })
            .min(1, { message: 'Name cannot be empty' }),
        phone: z
            .string({
                required_error: 'Phone is required',
            })
            .min(1, { message: 'Phone cannot be empty' }),
        nid: z.string().optional(),
        role: z.enum([...USER_ROLES_ARRAY] as [string, ...string[]], {
            message: 'Role is invalid',
        }),
    }),
});

// change password validation
const changePasswordValidationSchema = z.object({
    body: z.object({
        oldPassword: z
            .string({
                required_error: 'Old Password is required',
            })
            .min(1, { message: 'Password cannot be empty' }),
        newPassword: z
            .string({
                required_error: 'New Password is required',
            })
            .min(6, { message: 'New Password must be at least 6 character' }),
    }),
});

// update user status validation
const updateUserStatusValidationSchema = z.object({
    body: z.object({
        status: z.enum(['Active', 'Blocked'], {
            message: 'Status is invalid',
        }),
    }),
});

export const UserValidations = {
    createUserValidationSchema,
    changePasswordValidationSchema,
    updateUserStatusValidationSchema,
};

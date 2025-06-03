import { z } from 'zod';

// signin validation
const signinValidationSchema = z.object({
    body: z.object({
        phone: z
            .string({
                required_error: 'Phone is required',
            })
            .min(1, { message: 'Phone cannot be empty' }),
        password: z
            .string({
                required_error: 'Password is required',
            })
            .min(6, { message: 'Password must be at least 6 character' }),
    }),
});

// refresh token validation
const refreshTokenValidationSchema = z.object({
    cookies: z.object({
        refreshToken: z
            .string({
                required_error: 'Token is required',
            })
            .min(1, { message: 'Token cannot be empty' }),
    }),
});

// forget password validation
const forgetPasswordValidationSchema = z.object({
    body: z.object({
        phone: z
            .string({
                required_error: 'Phone is required',
            })
            .min(1, { message: 'Phone cannot be empty' }),
    }),
});

// reset password validation
const resetPasswordValidationSchema = z.object({
    body: z.object({
        password: z
            .string({
                required_error: 'Password is required',
            })
            .min(6, { message: 'Password must be at least 6 character' }),
    }),
});

export const AuthValidations = {
    signinValidationSchema,
    refreshTokenValidationSchema,
    forgetPasswordValidationSchema,
    resetPasswordValidationSchema,
};

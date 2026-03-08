import * as z from 'zod';

export const userUpdateSchema = z
    .object({
        name: z
            .string()
            .min(3, 'Name must be at least 3 characters long')
            .max(50, 'Name must be at most 50 characters long'),
        username: z
            .string()
            .min(5, 'Username must be at least 5 characters long')
            .max(16, 'Username must be at most 16 characters long'),
        bio: z.string().max(150, 'Bio must be at most 150 characters long'),
        link: z.url('Invalid website URL'),
        avatar: z.url('Avatar URL is invalid'),
        timezone: z.string(),
    })
    .partial();

export type UserUpdateSchema = z.infer<typeof userUpdateSchema>;

export const deleteUserSchema = z.object({
    password: z.string().min(1, 'Password is required'),
});

export type DeleteUserSchema = z.infer<typeof deleteUserSchema>;

export const changePasswordSchema = z.object({
    oldPassword: z.string().min(1, 'Old password is required'),
    newPassword: z.string().min(8, 'New password must be at least 8 characters long'),
});

export type ChangePasswordSchema = z.infer<typeof changePasswordSchema>;

export const changeEmailSchema = z.object({
    email: z.email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
});

export type ChangeEmailSchema = z.infer<typeof changeEmailSchema>;

export const changeTwoFactorSchema = z.object({
    password: z.string().min(1, 'Password is required'),
    twoFactorEnabled: z.boolean(),
});

export type ChangeTwoFactorSchema = z.infer<typeof changeTwoFactorSchema>;

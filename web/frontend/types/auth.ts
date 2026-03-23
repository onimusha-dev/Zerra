export interface User {
    id: number;
    name: string;
    username: string;
    email: string;
    bio?: string;
    link?: string;
    avatar?: string;
    banner?: string;
    isVerified: boolean;
    followersCount?: number;
    followingCount?: number;
    createdAt?: string;
}

export interface AuthResponse {
    status?: 'success' | 'error';
    success?: boolean;
    message: string;
    data: {
        user?: User;
        token?: string;
        accessToken?: string;
        twoFactorEnabled?: boolean;
    } | null;
    errors?: Array<{ field: string; message: string }>;
}

export interface RegisterInput {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    username: string;
    bio?: string;
    link?: string;
    avatar?: string;
    banner?: string;
    timezone?: string;
}

export interface LoginInput {
    email: string;
    password: string;
}

export interface UserResponse {
    status: 'success' | 'error';
    message: string;
    data: User | null;
}
export interface ForgotPasswordInput {
    email: string;
}

export interface ResetPasswordInput {
    uuid: string;
    otp: string;
    password?: string;
}

export interface VerifyEmailInput {
    email: string;
    token?: string;
    code?: string;
}

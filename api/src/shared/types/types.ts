import { RegisterSchema } from '@modules/auth/auth.validator';

/// USER SCHEMA
export interface IUser {
    id: number;
    name: string;
    email: string;
    username: string;
    bio?: string | null;
    link?: string | null;
    avatar?: string | null;
    isVerified: boolean;
    isUserBanned: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export type IUpdateUserProfile = Partial<Omit<IUser, 'id' | 'email' | 'createdAt' | 'updatedAt'>>;

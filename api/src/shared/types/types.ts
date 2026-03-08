import { RegisterSchema } from '@modules/auth/auth.validator';

/// USER SCHEMA
export type IUpdateUserProfile = Partial<Omit<RegisterSchema, 'password' | 'email'>>;

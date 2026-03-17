'use client';

import { useMutation } from '@tanstack/react-query';
import api from '@/lib/api';
import { AuthResponse, LoginInput, RegisterInput } from '@/types/auth';
import { useAuthStore } from '@/stores/useAuthStore';
import { useRouter } from 'next/navigation';

export const useAuthMutations = () => {
    const { setAuth, setToken, setUser } = useAuthStore();
    const router = useRouter();

    const loginMutation = useMutation({
        mutationFn: async (credentials: LoginInput) => {
            console.log('[useAuthMutations] Attempting login for:', credentials.email);
            const response = await api.post<AuthResponse>('/auth/login', credentials);
            return response.data;
        },
        onSuccess: async (response: any) => {
            console.log('[useAuthMutations] Login Success handler triggered');

            const isSuccess = response.success === true || response.status === 'success';
            const token = response.data?.accessToken || response.data?.token || response.token;
            const user = response.data?.user || response.user;

            if (isSuccess && token) {
                console.log('[useAuthMutations] Token found, setting state');
                // Update store with whatever we have
                if (user) {
                    setAuth(user, token);
                } else {
                    // Token only - fetch user data
                    setToken(token);
                    try {
                        console.log('[useAuthMutations] User data missing, fetching /users/me...');
                        // Force Authorization header for this request as interceptor might be too late
                        const meResponse = await api.get('/users/me', {
                            headers: { Authorization: `Bearer ${token}` },
                        });
                        const userData = meResponse.data?.data?.user || meResponse.data?.data;
                        if (userData) {
                            console.log('[useAuthMutations] Fetched user:', userData.username);
                            setAuth(userData, token);
                        }
                    } catch (error) {
                        console.error(
                            '[useAuthMutations] Failed to fetch user after login:',
                            error,
                        );
                    }
                }
            } else {
                console.warn('[useAuthMutations] Login failed success check', response);
            }
        },
        onError: (error) => {
            console.error('[useAuthMutations] Login error:', error);
        },
    });

    const registerMutation = useMutation({
        mutationFn: async (data: RegisterInput) => {
            console.log('[useAuthMutations] Attempting register for:', data.email);
            const response = await api.post<AuthResponse>('/auth/register', data);
            return response.data;
        },
        onSuccess: async (response: any) => {
            console.log('[useAuthMutations] Register Success handler triggered');

            const isSuccess = response.success === true || response.status === 'success';
            const token = response.data?.accessToken || response.data?.token || response.token;
            const user = response.data?.user || response.user;

            if (isSuccess && token) {
                if (user) {
                    setAuth(user, token);
                } else {
                    setToken(token);
                    try {
                        console.log('[useAuthMutations] Fetching user after registration...');
                        const meResponse = await api.get('/users/me', {
                            headers: { Authorization: `Bearer ${token}` },
                        });
                        const userData = meResponse.data?.data?.user || meResponse.data?.data;
                        if (userData) {
                            setAuth(userData, token);
                        }
                    } catch (error) {
                        console.error(
                            '[useAuthMutations] Failed to fetch user after register:',
                            error,
                        );
                    }
                }
            } else {
                console.warn('[useAuthMutations] Register failed standard check', response);
            }
        },
        onError: (error) => {
            console.error('[useAuthMutations] Register error:', error);
        },
    });

    return {
        loginMutation,
        registerMutation,
    };
};

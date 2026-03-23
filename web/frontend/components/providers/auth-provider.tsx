'use client';

import React, { useEffect } from 'react';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/useAuthStore';
import { AuthResponse, UserResponse } from '@/types/auth';

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const { setUser, logout, isAuthenticated, _hasHydrated } = useAuthStore();

    useEffect(() => {
        const verifyAuth = async () => {
            const token = localStorage.getItem('zerra_token');
            console.log('[AuthProvider] Token found:', !!token);
            if (!token) return;

            try {
                console.log('[AuthProvider] Verifying session via /users/me');
                const response = await api.get<any>('/users/me');
                const userData = response.data?.data?.user || response.data?.data;

                console.log('[AuthProvider] Verification result:', {
                    status: response.data?.status,
                    hasUser: !!userData,
                });

                if (userData && (userData.username || userData.id)) {
                    setUser(userData);
                }
            } catch (error: any) {
                console.error(
                    '[AuthProvider] Verification error:',
                    error.response?.status || error.message,
                );
                if (error.response?.status === 401 || error.response?.status === 404) {
                    console.error('[AuthProvider] Session invalid or expired, logging out');
                    logout();
                }
            }
        };

        if (_hasHydrated) {
            console.log('[AuthProvider] Hydration complete, running verification');
            verifyAuth();
        }
    }, [_hasHydrated, setUser, logout]);

    return <>{children}</>;
}

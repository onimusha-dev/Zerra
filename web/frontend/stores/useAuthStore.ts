'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/types/auth';

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    _hasHydrated: boolean;
    setHasHydrated: (state: boolean) => void;
    setAuth: (user: User, token: string) => void;
    setToken: (token: string) => void;
    setUser: (user: User) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            token: null,
            isAuthenticated: false,
            _hasHydrated: false,
            setHasHydrated: (state) => set({ _hasHydrated: state }),
            setAuth: (user, token) => {
                console.log('[AuthStore] Setting auth state:', {
                    username: user.username,
                    hasToken: !!token,
                });
                if (typeof window !== 'undefined') {
                    localStorage.setItem('zerra_token', token);
                }
                set({ user, token, isAuthenticated: true });
            },
            setToken: (token) => {
                console.log('[AuthStore] Setting token only:', !!token);
                if (typeof window !== 'undefined') {
                    localStorage.setItem('zerra_token', token);
                }
                set({ token });
            },
            setUser: (user) => {
                console.log('[AuthStore] Updating user data:', user.username);
                set({ user });
            },
            logout: () => {
                console.log('[AuthStore] Logging out');
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('zerra_token');
                }
                set({ user: null, token: null, isAuthenticated: false });
            },
        }),
        {
            name: 'zerra-auth-storage',
            onRehydrateStorage: () => (state) => {
                state?.setHasHydrated(true);
            },
        },
    ),
);

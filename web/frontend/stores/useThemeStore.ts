'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ZerraTheme = 'midnight' | 'eclipse' | 'aurora' | 'velocity' | 'verdant' | 'amber';

interface ThemeState {
    theme: ZerraTheme;
    setTheme: (theme: ZerraTheme) => void;
}

export const useThemeStore = create<ThemeState>()(
    persist(
        (set) => ({
            theme: 'midnight',
            setTheme: (theme) => {
                if (typeof window !== 'undefined') {
                    document.documentElement.setAttribute('data-theme', theme);
                }
                set({ theme });
            },
        }),
        {
            name: 'zerra-theme-storage',
        },
    ),
);

'use client';

import React, { ReactNode } from 'react';
import { UserProvider } from '@/contexts/UserContext';
import { ThemeProvider } from '@/contexts/ThemeContext';

/**
 * Root provider tree.
 * Add global providers here without touching layout.tsx.
 */
export function Providers({ children }: { children: ReactNode }) {
    return (
        <ThemeProvider>
            <UserProvider>{children}</UserProvider>
        </ThemeProvider>
    );
}

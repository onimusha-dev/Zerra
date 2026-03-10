'use client';

import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    ReactNode,
    useCallback,
} from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

export type ThemeMode = 'dark' | 'light';

export interface ColorScheme {
    id: string;
    label: string;
    primary: string; // oklch value
    primaryFg: string; // oklch value
    accent: string; // optional subtle accent
}

// ─── Color Schemes ────────────────────────────────────────────────────────────

export const COLOR_SCHEMES: ColorScheme[] = [
    {
        id: 'mono',
        label: 'Mono',
        primary: '0.92 0 0', // near-white
        primaryFg: '0.13 0 0',
        accent: '0.22 0 0',
    },
    {
        id: 'violet',
        label: 'Violet',
        primary: '0.65 0.22 285',
        primaryFg: '0.98 0 0',
        accent: '0.20 0.04 285',
    },
    {
        id: 'rose',
        label: 'Rose',
        primary: '0.65 0.20 10',
        primaryFg: '0.98 0 0',
        accent: '0.20 0.04 10',
    },
    {
        id: 'sky',
        label: 'Sky',
        primary: '0.65 0.13 220',
        primaryFg: '0.98 0 0',
        accent: '0.20 0.04 220',
    },
    {
        id: 'emerald',
        label: 'Emerald',
        primary: '0.60 0.15 150',
        primaryFg: '0.98 0 0',
        accent: '0.20 0.04 150',
    },
    {
        id: 'amber',
        label: 'Amber',
        primary: '0.72 0.16 75',
        primaryFg: '0.13 0 0',
        accent: '0.22 0.04 75',
    },
];

interface ThemeContextType {
    mode: ThemeMode;
    scheme: ColorScheme;
    setMode: (mode: ThemeMode) => void;
    setScheme: (scheme: ColorScheme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [mode, setModeState] = useState<ThemeMode>('dark');
    const [scheme, setSchemeState] = useState<ColorScheme>(COLOR_SCHEMES[0]);

    // Apply theme to DOM
    const applyTheme = useCallback((m: ThemeMode, s: ColorScheme) => {
        const root = document.documentElement;
        // Mode
        root.classList.toggle('dark', m === 'dark');

        // Primary color token
        root.style.setProperty('--primary', `oklch(${s.primary})`);
        root.style.setProperty('--primary-foreground', `oklch(${s.primaryFg})`);
        root.style.setProperty('--ring', `oklch(${s.primary} / 40%)`);
    }, []);

    // Load persisted preference
    useEffect(() => {
        const savedMode = (localStorage.getItem('zerra-mode') as ThemeMode) || 'dark';
        const savedSchemeId = localStorage.getItem('zerra-scheme') || 'mono';
        const savedScheme = COLOR_SCHEMES.find((c) => c.id === savedSchemeId) || COLOR_SCHEMES[0];
        setModeState(savedMode);
        setSchemeState(savedScheme);
        applyTheme(savedMode, savedScheme);
    }, [applyTheme]);

    const setMode = (m: ThemeMode) => {
        setModeState(m);
        localStorage.setItem('zerra-mode', m);
        applyTheme(m, scheme);
    };

    const setScheme = (s: ColorScheme) => {
        setSchemeState(s);
        localStorage.setItem('zerra-scheme', s.id);
        applyTheme(mode, s);
    };

    return (
        <ThemeContext.Provider value={{ mode, scheme, setMode, setScheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const ctx = useContext(ThemeContext);
    if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
    return ctx;
}

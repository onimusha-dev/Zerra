'use client';

import { useThemeStore } from '@/stores/useThemeStore';
import { useEffect, useState } from 'react';

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
    const { theme } = useThemeStore();
    const [mounted, setMounted] = useState(false);

    // Avoid hydration mismatch by waiting for mount
    useEffect(() => {
        setMounted(true);
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    if (!mounted) {
        return <div className="invisible">{children}</div>;
    }

    return <>{children}</>;
}

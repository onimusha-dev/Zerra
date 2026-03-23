'use client';

import { useComposeBoxStore } from '@/stores/useCreateNoteStore';
import { useEffect, useState, ReactNode } from 'react';

interface ComposeBoxProviderProps {
    children: ReactNode;
}

export function ComposeBoxProvider({ children }: ComposeBoxProviderProps) {
    const { isOpen } = useComposeBoxStore();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (mounted) {
            document.documentElement.setAttribute(
                'data-compose-box-open',
                isOpen ? 'true' : 'false',
            );
        }
    }, [isOpen, mounted]);

    if (!mounted) return <div className="invisible">{children}</div>;

    return <>{children}</>;
}

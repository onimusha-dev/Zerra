'use client';

import React, { useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';

interface InfiniteScrollTriggerProps {
    onIntersect: () => void;
    isLoading: boolean;
    hasMore: boolean;
}

export function InfiniteScrollTrigger({
    onIntersect,
    isLoading,
    hasMore,
}: InfiniteScrollTriggerProps) {
    const triggerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const trigger = triggerRef.current;
        if (!trigger || !hasMore || isLoading) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    onIntersect();
                }
            },
            { threshold: 0.1, rootMargin: '200px' },
        );

        observer.observe(trigger);

        return () => {
            observer.disconnect();
        };
    }, [onIntersect, isLoading, hasMore]);

    if (!hasMore) return null;

    return (
        <div ref={triggerRef} className="flex h-32 w-full items-center justify-center p-4">
            {isLoading && <Loader2 className="h-8 w-8 animate-spin text-primary-ui" />}
        </div>
    );
}

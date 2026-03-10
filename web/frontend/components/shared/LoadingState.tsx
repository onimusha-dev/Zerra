import React from 'react';
import { cn } from '@/lib/utils';

interface LoadingStateProps {
    message?: string;
    className?: string;
}

export function LoadingState({ message = 'Loading…', className }: LoadingStateProps) {
    return (
        <div className={cn('flex flex-col items-center justify-center py-20 gap-4', className)}>
            <div className="h-6 w-6 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
            <span className="text-[9px] font-black uppercase tracking-[0.35em] text-muted-foreground/30">
                {message}
            </span>
        </div>
    );
}

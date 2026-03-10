import React from 'react';
import { ElementType } from 'react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
    title?: string;
    description?: string;
    icon?: ElementType;
    action?: React.ReactNode;
    className?: string;
}

export function EmptyState({
    title = 'Nothing here yet',
    description,
    icon: Icon,
    action,
    className,
}: EmptyStateProps) {
    return (
        <div
            className={cn(
                'flex flex-col items-center justify-center py-16 px-6 text-center',
                className,
            )}
        >
            {Icon && (
                <div className="h-12 w-12 rounded-2xl bg-muted/30 border border-border/15 flex items-center justify-center mb-4">
                    <Icon className="h-5 w-5 text-muted-foreground/50" />
                </div>
            )}
            <p className="text-sm font-black uppercase tracking-[0.15em] text-foreground/50 mb-1.5">
                {title}
            </p>
            {description && (
                <p className="text-[11px] font-medium text-muted-foreground/50 max-w-xs leading-relaxed">
                    {description}
                </p>
            )}
            {action && <div className="mt-5">{action}</div>}
        </div>
    );
}

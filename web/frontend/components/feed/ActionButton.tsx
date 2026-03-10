import React, { ElementType } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface ActionButtonProps {
    icon: ElementType;
    count?: number;
    color?: string;
    active?: boolean;
    onClick?: (e: React.MouseEvent) => void;
    href?: string;
    size?: number;
    className?: string;
}

export function ActionButton({
    icon: Icon,
    count,
    color = 'primary',
    active,
    onClick,
    href,
    size = 18,
    className,
}: ActionButtonProps) {
    const Component = href ? Link : 'button';

    // Map common colors to ensure tailwind picks them up
    const colorMap: Record<string, string> = {
        primary: active ? 'text-primary' : 'group-hover:text-primary',
        'rose-500': active ? 'text-rose-500' : 'group-hover:text-rose-500',
        'sky-500': active ? 'text-sky-500' : 'group-hover:text-sky-500',
    };

    const activeBgMap: Record<string, string> = {
        primary: 'group-hover:bg-primary/10',
        'rose-500': 'group-hover:bg-rose-500/10',
        'sky-500': 'group-hover:bg-sky-500/10',
    };

    return (
        <Component
            href={href as any}
            onClick={onClick}
            className={cn(
                'flex items-center gap-2 text-sm transition-all duration-300 active:scale-95 group relative',
                colorMap[color] || (active ? 'text-primary' : 'group-hover:text-primary'),
                className,
            )}
        >
            <div
                className={cn(
                    'p-2 rounded-full transition-colors',
                    activeBgMap[color] || 'group-hover:bg-primary/10',
                )}
            >
                <Icon
                    className={cn(
                        'transition-transform duration-300 group-hover:scale-110',
                        active && 'fill-current',
                    )}
                    size={size}
                />
            </div>
            {count !== undefined && (
                <span className="text-[10px] font-black uppercase tracking-widest opacity-40 group-hover:opacity-100 transition-opacity">
                    {count}
                </span>
            )}
        </Component>
    );
}

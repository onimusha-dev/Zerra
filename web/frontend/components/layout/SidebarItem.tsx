import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface SidebarItemProps {
    name: string;
    path: string;
    icon: any;
    isActive: boolean;
}

export function SidebarItem({ name, path, icon: Icon, isActive }: SidebarItemProps) {
    return (
        <Link
            href={path}
            className={cn(
                'flex items-center justify-center xl:justify-start gap-4 py-3 xl:px-4 transition-all group rounded-2xl',
                isActive
                    ? 'text-primary xl:bg-primary/10 shadow-sm'
                    : 'text-primary/30 hover:text-primary hover:bg-muted/50',
            )}
        >
            <Icon
                className={cn(
                    'h-6 w-6 shrink-0 transition-transform group-hover:scale-110 duration-200',
                    isActive && 'stroke-[2.5px] fill-primary/10',
                )}
            />
            <span
                className={cn(
                    'hidden xl:inline text-xs font-bold tracking-[0.15em] transition-all whitespace-nowrap',
                    isActive
                        ? 'text-primary brightness-125'
                        : 'text-muted-foreground/60 group-hover:text-primary',
                )}
            >
                {name}
            </span>
        </Link>
    );
}

import React from 'react';
import Link from 'next/link';
import { ElementType } from 'react';
import { cn } from '@/lib/utils';

interface SidebarItemProps {
    name: string;
    path: string;
    icon: ElementType;
    isActive: boolean;
}

export function SidebarItem({ name, path, icon: Icon, isActive }: SidebarItemProps) {
    return (
        <Link
            href={path}
            className={cn(
                'flex items-center justify-center lg:justify-start gap-4 py-3 lg:px-4 rounded-2xl transition-all duration-200 group',
                isActive
                    ? 'text-primary bg-primary/8'
                    : 'text-muted-foreground/40 hover:text-foreground hover:bg-muted/30',
            )}
        >
            <Icon
                className={cn(
                    'h-5 w-5 shrink-0 transition-all duration-200',
                    isActive ? 'stroke-[2.5]' : 'group-hover:scale-105',
                )}
            />
            <span
                className={cn(
                    'hidden lg:inline text-[11px] font-black tracking-[0.15em] uppercase whitespace-nowrap transition-all',
                    isActive
                        ? 'text-primary'
                        : 'text-muted-foreground/50 group-hover:text-foreground',
                )}
            >
                {name}
            </span>
        </Link>
    );
}

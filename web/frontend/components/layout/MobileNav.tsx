'use client';

import React from 'react';
import Link from 'next/link';
import { Home, User, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';

export function MobileNav() {
    const pathname = usePathname();

    const links = [
        { href: '/', icon: Home, label: 'Home' },
        { href: '/profile', icon: User, label: 'Profile' },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-background/95 backdrop-blur-md border-t border-border/10 flex items-center justify-around py-4 px-6">
            {links.map((link, idx) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;

                // Custom logic for center button if needed, but for now just mapping
                if (idx === 1) {
                    return (
                        <React.Fragment key="center">
                            <div className="h-12 w-12 bg-primary flex items-center justify-center -translate-y-4 border border-border/10 shadow-lg shadow-primary/20 rounded-2xl active:scale-95 transition-all">
                                <Zap className="h-6 w-6 text-primary-foreground fill-current" />
                            </div>
                            <Link key={link.href} href={link.href}>
                                <Icon
                                    className={cn(
                                        'h-5 w-5 transition-colors',
                                        isActive
                                            ? 'text-primary'
                                            : 'text-muted-foreground/30 hover:text-primary',
                                    )}
                                />
                            </Link>
                        </React.Fragment>
                    );
                }

                return (
                    <Link key={link.href} href={link.href}>
                        <Icon
                            className={cn(
                                'h-5 w-5 transition-colors',
                                isActive
                                    ? 'text-primary'
                                    : 'text-muted-foreground/30 hover:text-primary',
                            )}
                        />
                    </Link>
                );
            })}
        </div>
    );
}

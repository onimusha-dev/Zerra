'use client';

import React from 'react';
import Link from 'next/link';
import { Home, Newspaper, Bookmark, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';
import { useUser } from '@/hooks/useUser';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const NAV = [
    { href: '/', icon: Home, label: 'Home' },
    { href: '/articles', icon: Newspaper, label: 'Journal' },
    { href: '/bookmarks', icon: Bookmark, label: 'Saved' },
] as const;

export function MobileNav() {
    const pathname = usePathname();
    const { user } = useUser();

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
            <div className="bg-background/90 backdrop-blur-2xl border-t border-border/8 flex items-center justify-around px-2 h-[72px] safe-area-bottom">
                {NAV.map(({ href, icon: Icon, label }) => {
                    const active = pathname === href;
                    return (
                        <Link
                            key={href}
                            href={href}
                            className="flex flex-col items-center gap-1 p-2 rounded-xl group transition-all"
                        >
                            <Icon
                                className={cn(
                                    'h-5 w-5 transition-all duration-200',
                                    active
                                        ? 'text-primary scale-110 stroke-[2.5]'
                                        : 'text-muted-foreground/35 group-hover:text-muted-foreground/70',
                                )}
                            />
                            <span
                                className={cn(
                                    'text-[8px] font-black uppercase tracking-widest transition-colors',
                                    active ? 'text-primary' : 'text-muted-foreground/25',
                                )}
                            >
                                {label}
                            </span>
                        </Link>
                    );
                })}

                {/* Center Zap button */}
                <Link href="/" className="flex flex-col items-center" aria-label="Broadcast">
                    <div className="h-12 w-12 bg-primary flex items-center justify-center -translate-y-5 border-[3px] border-background shadow-xl shadow-primary/30 rounded-2xl active:scale-90 transition-transform">
                        <Zap className="h-6 w-6 text-primary-foreground fill-current" />
                    </div>
                </Link>

                {/* Avatar */}
                <Link
                    href={user ? `/profile?username=${user.username}` : '/auth/login'}
                    className="flex flex-col items-center gap-1 p-2 group"
                >
                    <Avatar
                        className={cn(
                            'h-7 w-7 rounded-xl border-2 transition-all duration-200',
                            pathname.includes('/profile')
                                ? 'border-primary scale-110'
                                : 'border-border/10 group-hover:border-primary/30',
                        )}
                    >
                        <AvatarImage src={user?.avatar} className="object-cover" />
                        <AvatarFallback className="text-[7px] font-black uppercase bg-primary/10 text-primary">
                            {(user?.name || 'Z')[0]}
                        </AvatarFallback>
                    </Avatar>
                    <span
                        className={cn(
                            'text-[8px] font-black uppercase tracking-widest transition-colors',
                            pathname.includes('/profile')
                                ? 'text-primary'
                                : 'text-muted-foreground/25',
                        )}
                    >
                        You
                    </span>
                </Link>
            </div>
        </nav>
    );
}

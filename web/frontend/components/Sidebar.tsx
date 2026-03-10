'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Newspaper, Bookmark, Settings, Zap } from 'lucide-react';
import { useUser } from '@/hooks/useUser';
import { SidebarItem } from './layout/SidebarItem';
import { SidebarUser } from './layout/SidebarUser';

const NAV_ITEMS = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Journal', path: '/articles', icon: Newspaper },
    { name: 'Bookmarks', path: '/bookmarks', icon: Bookmark },
    { name: 'Settings', path: '/settings', icon: Settings },
] as const;

export function Sidebar() {
    const pathname = usePathname();
    const { user, isLoading } = useUser();

    return (
        <aside className="hidden md:flex flex-col sticky top-0 h-screen py-8 justify-between bg-background w-20 lg:w-60 xl:w-68 shrink-0 border-r border-border/5">
            {/* Top: Logo + Nav */}
            <div className="flex flex-col items-center lg:items-start gap-8 px-3 lg:px-5">
                {/* Logo */}
                <Link
                    href="/"
                    className="flex items-center justify-center lg:justify-start gap-3 px-1 hover:opacity-80 transition-opacity"
                >
                    <Zap
                        className="h-9 w-9 text-primary fill-current shrink-0"
                        style={{ filter: 'drop-shadow(0 0 12px oklch(0.92 0 0 / 0.4))' }}
                    />
                    <span className="hidden lg:inline font-black text-2xl tracking-tighter uppercase leading-none">
                        Zerra
                    </span>
                </Link>

                {/* Navigation */}
                <nav className="w-full space-y-1">
                    {NAV_ITEMS.map((item) => (
                        <SidebarItem
                            key={item.path}
                            path={item.path}
                            name={item.name}
                            icon={item.icon}
                            isActive={pathname === item.path}
                        />
                    ))}
                </nav>
            </div>

            {/* Bottom: User Identity */}
            <div className="px-3 lg:px-5 border-t border-border/5 pt-6">
                <SidebarUser user={user} loading={isLoading} />
            </div>
        </aside>
    );
}

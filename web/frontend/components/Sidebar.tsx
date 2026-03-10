'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Newspaper, User, Terminal, Zap, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUser } from '@/hooks/useUser';
import { SidebarItem } from './layout/SidebarItem';
import { SidebarUser } from './layout/SidebarUser';

export function Sidebar() {
    const pathname = usePathname();
    const { user, isLoading: loading } = useUser();

    const menuItems = [
        { name: 'Home', path: '/', icon: Home },
        { name: 'Journal', path: '/articles', icon: Newspaper },
        { name: 'Identity', path: '/profile', icon: User },
        { name: 'Status', path: '/health', icon: Terminal },
        { name: 'Settings', path: '/settings', icon: Settings },
    ];

    return (
        <div className="hidden md:flex flex-col h-full py-10 justify-between border-r border-border/10 bg-background/60 backdrop-blur-2xl transition-all duration-500">
            <div className="space-y-12 flex flex-col items-center xl:items-start px-4 xl:px-8">
                <Link
                    href="/"
                    className="flex items-center justify-center xl:justify-start gap-4 hover:opacity-80 transition-opacity"
                >
                    <Zap className="h-10 w-10 text-primary fill-current filter drop-shadow-[0_0_15px_rgba(var(--primary),0.6)] shrink-0" />
                    <span className="hidden xl:inline font-black text-3xl tracking-tighter uppercase italic leading-none text-foreground">
                        Zerra
                    </span>
                </Link>

                <nav className="w-full space-y-4 pt-4">
                    {menuItems.map((item) => (
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

            <div className="space-y-6 flex flex-col items-center xl:items-stretch px-4 xl:px-8">
                {user && (
                    <Button
                        className="h-12 w-12 xl:w-full xl:h-14 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-2xl shadow-primary/20 transition-all hover:shadow-primary/40 hover:-translate-y-1 active:scale-95 group overflow-hidden p-0 xl:px-6"
                        onClick={() => window.dispatchEvent(new CustomEvent('open-new-post'))}
                    >
                        <Zap className="h-6 w-6 fill-current shrink-0" />
                        <span className="hidden xl:inline ml-3 font-bold uppercase tracking-[0.2em] text-[10px]">
                            Transmit
                        </span>
                    </Button>
                )}

                <div className="pt-8 w-full border-t border-border/10 flex justify-center xl:justify-start">
                    <SidebarUser user={user} loading={loading} />
                </div>
            </div>
        </div>
    );
}

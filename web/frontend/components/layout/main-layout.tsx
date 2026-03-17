'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import {
    Home,
    Search,
    Bell,
    Mail,
    Bookmark,
    User,
    Settings,
    MoreHorizontal,
    Sparkles,
    Plus,
} from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '@/stores/useAuthStore';
import { getMediaUrl } from '@/lib/utils';
import { VerificationBadge } from '@/components/ui/verification-badge';

interface MainLayoutProps {
    children: React.ReactNode;
    hideSidebar?: boolean;
}

export default function MainLayout({ children, hideSidebar = false }: MainLayoutProps) {
    const { user, isAuthenticated, logout } = useAuthStore();

    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    const navItems = [
        { icon: Home, label: 'Home', href: '/' },
        { icon: Search, label: 'Explore', href: '/explore' },
        { icon: Bell, label: 'Notifications', href: '/notifications' },
        { icon: Mail, label: 'Messages', href: '/messages' },
        { icon: Bookmark, label: 'Bookmarks', href: '/bookmarks' },
        { icon: Sparkles, label: 'Fern AI', href: '/fern' },
        {
            icon: User,
            label: 'Profile',
            href: mounted && isAuthenticated && user ? `/profile/${user.username}` : '/auth/login',
        },
        { icon: Settings, label: 'Settings', href: '/settings' },
    ];

    return (
        <div className="flex min-h-screen justify-center transition-colors duration-300">
            <div className="flex w-full max-w-[1265px] px-0 sm:px-4">
                {/* Left Sidebar - Navigation */}
                <header className="fixed bottom-0 z-10 flex h-16 w-full items-center justify-around border-t bg-background px-2 sm:sticky sm:top-0 sm:h-screen sm:w-20 sm:flex-col sm:items-end sm:justify-start sm:border-r sm:border-t-0 sm:pb-4 sm:pt-2 md:w-[275px] md:items-start lg:w-[275px]">
                    <div className="hidden items-center justify-center p-3 sm:flex">
                        <div className="h-8 w-8 rounded-full bg-primary-ui flex items-center justify-center text-background font-bold text-xl italic select-none">
                            Z
                        </div>
                    </div>

                    <nav className="flex w-full items-center justify-around sm:mt-4 sm:flex-col sm:items-end md:items-start">
                        {navItems.map((item) => (
                            <Link
                                key={item.label}
                                href={item.href}
                                className="group flex items-center gap-4 rounded-full p-3 transition-colors hover:bg-secondary-ui select-none"
                            >
                                <item.icon className="h-7 w-7 text-foreground" />
                                <span className="hidden text-xl font-medium md:block">
                                    {item.label}
                                </span>
                            </Link>
                        ))}
                    </nav>

                    <div className="w-full px-2 sm:px-4 mt-2 sm:mt-6 hidden sm:block select-none">
                        <Link
                            href="/articles/create"
                            className="flex w-full items-center justify-center gap-2 rounded-full bg-foreground py-3.5 font-bold text-background shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98]"
                        >
                            <span className="hidden text-[17px] md:block">Write Article</span>
                            <Plus className="h-6 w-6 md:hidden" />
                        </Link>
                    </div>

                    <div className="mt-auto hidden w-full sm:block select-none">
                        {isAuthenticated && user ? (
                            <div className="flex w-full items-center gap-3 rounded-full p-3 transition-colors hover:bg-secondary-ui md:px-3 cursor-pointer group relative">
                                <div className="h-10 w-10 shrink-0 rounded-full bg-accent-ui flex items-center justify-center overflow-hidden border border-border-ui">
                                    {user.avatar ? (
                                        <img
                                            src={getMediaUrl(user.avatar)}
                                            alt={user.name}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <User className="h-6 w-6 opacity-40" />
                                    )}
                                </div>
                                <div className="hidden flex-col md:flex">
                                    <span className="text-sm font-bold truncate max-w-[120px] flex items-center gap-1">
                                        {user.name}
                                        {user.isVerified && <VerificationBadge size={14} />}
                                    </span>
                                    <span className="text-xs text-secondary-foreground opacity-60 truncate max-w-[120px]">
                                        @{user.username}
                                    </span>
                                </div>
                                <MoreHorizontal className="ml-auto hidden h-5 w-5 md:block" />

                                <button
                                    onClick={() => logout()}
                                    className="absolute bottom-full left-0 mb-2 hidden w-full items-center gap-2 rounded-xl border bg-background p-3 text-sm font-semibold text-destructive shadow-xl group-hover:flex"
                                >
                                    Log out @{user.username}
                                </button>
                            </div>
                        ) : (
                            <Link
                                href="/auth/login"
                                className="flex w-full items-center justify-center rounded-full bg-primary-ui py-3 font-bold text-background transition-all hover:opacity-90"
                            >
                                <span className="hidden md:block">Log in</span>
                                <User className="h-6 w-6 md:hidden" />
                            </Link>
                        )}
                    </div>
                </header>

                {/* Center - Main Content */}
                <main
                    className={cn(
                        'grow border-x w-full min-h-screen pb-16 sm:pb-0',
                        !hideSidebar && 'max-w-[600px]',
                    )}
                >
                    {children}
                </main>

                {/* Right Sidebar - Trends/Search */}
                {!hideSidebar && (
                    <aside className="hidden w-[290px] flex-col gap-4 p-4 lg:flex xl:w-[350px]">
                        <div className="sticky top-0 flex flex-col gap-4 pt-2">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-secondary-foreground opacity-50" />
                                <input
                                    type="text"
                                    placeholder="Search Zerra"
                                    className="w-full rounded-full bg-secondary-ui py-3 pl-12 pr-4 outline-none focus:ring-1 focus:ring-primary-ui"
                                />
                            </div>

                            <div className="rounded-2xl bg-secondary-ui p-4">
                                <h2 className="text-xl font-bold mb-4">What&apos;s happening</h2>
                                <div className="flex flex-col gap-4">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="flex flex-col">
                                            <span className="text-xs text-secondary-foreground opacity-60">
                                                Trending in Tech
                                            </span>
                                            <span className="font-bold">#ZerraPremium</span>
                                            <span className="text-xs text-secondary-foreground opacity-60">
                                                12.4K Posts
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </aside>
                )}
            </div>
        </div>
    );
}

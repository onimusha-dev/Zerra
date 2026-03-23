'use client';

import React from 'react';
import MainLayout from '@/components/layout/main-layout';
import { User, Lock, Bell, Eye, LogOut, ChevronRight, Palette } from 'lucide-react';
import { useAuthStore } from '@/stores/useAuthStore';
import { useThemeStore, ZerraTheme } from '@/stores/useThemeStore';
import { cn } from '@/lib/utils';
import Link from 'next/link';

const THEMES: { id: ZerraTheme; name: string; class: string }[] = [
    { id: 'midnight', name: 'Midnight', class: 'bg-black border-white' },
    { id: 'eclipse', name: 'Eclipse', class: 'bg-[#15202b] border-[#1d9bf0]' },
    { id: 'aurora', name: 'Aurora', class: 'bg-[#0b1120] border-[#38bdf8]' },
    { id: 'velocity', name: 'Velocity', class: 'bg-[#0f0505] border-[#e11d48]' },
    { id: 'verdant', name: 'Verdant', class: 'bg-[#050f0a] border-[#10b981]' },
    { id: 'amber', name: 'Amber', class: 'bg-[#0d0a02] border-[#f59e0b]' },
];

export default function SettingsPage() {
    const { user, logout } = useAuthStore();
    const { theme, setTheme } = useThemeStore();

    const sections = [
        {
            title: 'Your Account',
            items: [
                {
                    icon: User,
                    label: 'Account Information',
                    desc: 'See your account details, email, and phone number',
                    href: '/settings/account',
                },
                {
                    icon: Lock,
                    label: 'Change your password',
                    desc: 'Change your password at any time',
                    href: '/settings/password',
                },
            ],
        },
        {
            title: 'Zerra Blue',
            items: [
                {
                    icon: Palette,
                    label: 'Premium Preferences',
                    desc: 'Manage your premium membership and theme settings',
                    href: '/settings/premium',
                },
            ],
        },
        {
            title: 'Navigation',
            items: [
                {
                    icon: Bell,
                    label: 'Notifications',
                    desc: 'Select the kinds of notifications you get about your activities',
                    href: '/settings/notifications',
                },
                {
                    icon: Eye,
                    label: 'Privacy and safety',
                    desc: 'Manage what information you allow other people on Zerra to see',
                    href: '/settings/privacy',
                },
            ],
        },
    ];

    return (
        <MainLayout>
            <div className="flex h-14 items-center border-b px-4 sticky top-0 bg-background/80 backdrop-blur-md z-10">
                <h2 className="text-xl font-bold">Settings</h2>
            </div>

            <div className="flex flex-col pb-20">
                <div className="p-6 border-b bg-secondary-ui/5">
                    <div className="flex items-center gap-2 mb-4">
                        <Palette className="h-5 w-5 text-primary-ui" />
                        <span className="font-semibold text-sm">Theme Preferences</span>
                    </div>
                    <p className="text-secondary-foreground opacity-60 text-xs mb-6">
                        Choose your perfect view. These settings affect all Zerra accounts on this
                        browser.
                    </p>
                    <div className="flex flex-wrap gap-4">
                        {THEMES.map((t) => (
                            <button
                                key={t.id}
                                onClick={() => setTheme(t.id)}
                                className={cn(
                                    'flex flex-col items-center gap-2 transition-all duration-300',
                                    theme === t.id ? 'scale-110' : 'opacity-60 hover:opacity-100',
                                )}
                            >
                                <div
                                    className={cn(
                                        'h-10 w-10 rounded-full border-2 shadow-lg',
                                        t.class,
                                    )}
                                />
                                <span className="text-[10px] font-medium uppercase tracking-wider">
                                    {t.name}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {sections.map((section, idx) => (
                    <div key={section.title} className={cn('flex flex-col', idx > 0 && 'mt-2')}>
                        <h3 className="px-4 py-3 text-lg font-bold text-foreground">
                            {section.title}
                        </h3>
                        {section.items.map((item) => (
                            <Link
                                key={item.label}
                                href={item.href}
                                className="flex w-full items-center gap-4 px-4 py-4 transition-colors hover:bg-secondary-ui/50 group"
                            >
                                <item.icon className="h-6 w-6 text-secondary-foreground opacity-60 group-hover:text-primary-ui" />
                                <div className="flex flex-col items-start text-left">
                                    <span className="font-medium text-[15px]">{item.label}</span>
                                    <span className="text-xs text-secondary-foreground opacity-60">
                                        {item.desc}
                                    </span>
                                </div>
                                <ChevronRight className="ml-auto h-5 w-5 text-secondary-foreground opacity-30" />
                            </Link>
                        ))}
                    </div>
                ))}

                <div className="mt-8 px-4">
                    <button
                        onClick={() => logout()}
                        className="flex w-full items-center gap-4 rounded-2xl border border-destructive/20 bg-destructive/5 p-4 text-destructive transition-colors hover:bg-destructive hover:text-white"
                    >
                        <LogOut className="h-6 w-6" />
                        <div className="flex flex-col items-start text-left">
                            <span className="font-bold">Log out</span>
                            <span className="text-xs opacity-70 italic">
                                End your current session on this device
                            </span>
                        </div>
                    </button>
                </div>
            </div>
        </MainLayout>
    );
}

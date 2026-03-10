'use client';

import React, { useState } from 'react';
import { User, ShieldCheck, Accessibility, ArrowLeft, Settings } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useUser } from '@/hooks/useUser';
import { AccountProtocol } from '@/components/settings/AccountProtocol';
import { DisplayProtocol } from '@/components/settings/DisplayProtocol';
import { SecurityProtocol } from '@/components/settings/SecurityProtocol';

export default function SettingsPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('account');
    const { user } = useUser();

    const settingsCategories = [
        {
            id: 'account',
            label: 'Identity',
            icon: User,
            description: 'Manage your persona and digital footprint.',
        },
        {
            id: 'security',
            label: 'Vault',
            icon: ShieldCheck,
            description: 'Secure your presence with high-level protocols.',
        },
        {
            id: 'display',
            label: 'Interface',
            icon: Accessibility,
            description: 'Calibrate your visual experience.',
        },
    ];

    return (
        <div className="flex flex-col min-h-screen">
            <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md px-4 py-8 mb-8 border-b border-border/10 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tighter uppercase italic leading-none">
                        Settings
                    </h1>
                    <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-primary/40 mt-1">
                        Configuration Control Hub
                    </p>
                </div>
                <Button
                    variant="outline"
                    size="icon"
                    className="rounded-none h-9 w-9 border-border/20 hover:border-primary/40 transition-colors"
                    onClick={() => router.back()}
                >
                    <ArrowLeft className="h-4 w-4" />
                </Button>
            </div>

            <div className="max-w-4xl mx-auto w-full px-4 space-y-10 pb-16">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-in fade-in duration-700">
                    {settingsCategories.map((cat) => {
                        const Icon = cat.icon;
                        const isActive = activeTab === cat.id;
                        return (
                            <button
                                key={cat.id}
                                onClick={() => setActiveTab(cat.id)}
                                className={cn(
                                    'minimal-card p-6 text-left transition-all border-border/10 interactive-hover',
                                    isActive
                                        ? 'border-primary bg-secondary/30 ring-1 ring-primary/20'
                                        : 'opacity-40 hover:opacity-100',
                                )}
                            >
                                <Icon
                                    className={cn(
                                        'h-4 w-4 mb-4',
                                        isActive ? 'text-primary' : 'text-muted-foreground/20',
                                    )}
                                />
                                <h3 className="font-bold text-sm tracking-tight mb-1 uppercase italic">
                                    {cat.label}
                                </h3>
                                <p className="text-[9px] font-bold text-muted-foreground/30 uppercase leading-tight tracking-widest">
                                    {cat.description}
                                </p>
                            </button>
                        );
                    })}
                </div>

                <div className="minimal-card p-8 border-border/10 bg-card/10 animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <div className="mb-10 pb-6 border-b border-border/10">
                        <h2 className="text-3xl font-bold tracking-tighter uppercase italic leading-none">
                            {settingsCategories.find((c) => c.id === activeTab)?.label}
                        </h2>
                        <p className="text-[9px] font-bold uppercase tracking-widest text-primary/40 mt-2">
                            Active Protocol Configuration
                        </p>
                    </div>

                    <div className="space-y-2">
                        {activeTab === 'account' && <AccountProtocol user={user} />}
                        {activeTab === 'display' && <DisplayProtocol />}
                        {activeTab === 'security' && <SecurityProtocol />}
                    </div>
                </div>

                <div className="py-12 flex flex-col items-center gap-4 opacity-10">
                    <Settings className="h-3.5 w-3.5 animate-pulse" />
                    <p className="text-[8px] font-bold uppercase tracking-[0.5em]">
                        Zerra Core Release Beta-1.0
                    </p>
                </div>
            </div>
        </div>
    );
}

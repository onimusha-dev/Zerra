'use client';

import React, { useState } from 'react';
import { User, ShieldCheck, Palette, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUser } from '@/hooks/useUser';
import { AccountProtocol } from '@/components/settings/AccountProtocol';
import { DisplayProtocol } from '@/components/settings/DisplayProtocol';
import { SecurityProtocol } from '@/components/settings/SecurityProtocol';
import { PageHeader } from '@/components/shared/PageHeader';

const CATEGORIES = [
    { id: 'account', label: 'Identity', icon: User, description: 'Persona & digital footprint' },
    {
        id: 'display',
        label: 'Appearance',
        icon: Palette,
        description: 'Themes, colors & interface',
    },
    { id: 'security', label: 'Vault', icon: ShieldCheck, description: 'Security protocols' },
] as const;

type CategoryId = (typeof CATEGORIES)[number]['id'];

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState<CategoryId>('account');
    const { user } = useUser();
    const active = CATEGORIES.find((c) => c.id === activeTab)!;

    return (
        <div className="flex flex-col min-h-screen pb-24">
            <PageHeader title="Settings" subtitle="Configuration Hub" />

            <div className="px-4 space-y-6">
                {/* Category Tabs */}
                <div className="flex gap-2 p-1 bg-muted/30 rounded-2xl border border-border/10">
                    {CATEGORIES.map(({ id, label, icon: Icon }) => (
                        <button
                            key={id}
                            onClick={() => setActiveTab(id)}
                            className={cn(
                                'flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] transition-all duration-200 flex-1 justify-center',
                                activeTab === id
                                    ? 'bg-background text-foreground shadow-sm border border-border/10'
                                    : 'text-muted-foreground/40 hover:text-muted-foreground/70',
                            )}
                        >
                            <Icon className="h-3.5 w-3.5 shrink-0" />
                            <span className="hidden sm:inline">{label}</span>
                        </button>
                    ))}
                </div>

                {/* Panel */}
                <div className="bg-card/30 border border-border/10 rounded-3xl p-6 animate-in fade-in slide-in-from-bottom-1 duration-300">
                    <div className="mb-6 pb-5 border-b border-border/8">
                        <h2 className="text-xl font-black tracking-tight uppercase">
                            {active.label}
                        </h2>
                        <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-muted-foreground/40 mt-1">
                            {active.description}
                        </p>
                    </div>

                    {activeTab === 'account' && <AccountProtocol user={user} />}
                    {activeTab === 'display' && <DisplayProtocol />}
                    {activeTab === 'security' && <SecurityProtocol />}
                </div>

                {/* Footer */}
                <div className="py-10 flex items-center justify-center gap-3 opacity-10">
                    <Settings className="h-3 w-3 animate-pulse" />
                    <p className="text-[8px] font-black uppercase tracking-[0.4em]">
                        Zerra · Core β 1.0
                    </p>
                </div>
            </div>
        </div>
    );
}

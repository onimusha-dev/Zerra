'use client';

import React, { useState } from 'react';
import MainLayout from '@/components/layout/main-layout';
import { Bell, Settings, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function NotificationsPage() {
    const [activeTab, setActiveTab] = useState('all');

    return (
        <MainLayout>
            <div className="flex flex-col border-b sticky top-0 bg-background/80 backdrop-blur-md z-10">
                <div className="flex items-center justify-between px-4 h-14">
                    <h2 className="text-xl font-bold">Notifications</h2>
                    <button className="rounded-full p-2 transition-colors hover:bg-secondary-ui">
                        <Settings className="h-5 w-5" />
                    </button>
                </div>

                <div className="flex w-full">
                    {['all', 'verified', 'mentions'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className="relative flex-1 py-4 text-sm font-bold capitalize transition-colors"
                        >
                            <span
                                className={cn(
                                    activeTab === tab
                                        ? 'text-foreground'
                                        : 'text-secondary-foreground opacity-60',
                                )}
                            >
                                {tab}
                            </span>
                            {activeTab === tab && (
                                <div className="absolute bottom-0 left-1/2 h-1 w-14 -translate-x-1/2 rounded-full bg-primary-ui" />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex flex-col items-center justify-center h-[50vh] p-8 text-center max-w-sm mx-auto">
                <div className="relative mb-6">
                    <Bell className="h-16 w-16 text-primary-ui opacity-20" />
                    <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary-ui border-4 border-background" />
                </div>
                <h2 className="text-3xl font-bold mb-2">Nothing to see here — yet</h2>
                <p className="text-secondary-foreground opacity-60">
                    From likes to retweets and a whole lot more, this is where all the action
                    happens.
                </p>
            </div>
        </MainLayout>
    );
}

'use client';

import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { useState } from 'react';

interface ProfileTabsProps {
    activeTab: string;
    onChange: (tab: string) => void;
    counts?: {
        posts?: number;
        articles?: number;
        likes?: number;
    };
}

export default function ProfileTabs({ activeTab, onChange, counts }: ProfileTabsProps) {
    const TABS = [
        { id: 'posts', label: 'Posts', count: counts?.posts },
        { id: 'articles', label: 'Articles', count: counts?.articles },
        { id: 'replies', label: 'Replies' },
        { id: 'likes', label: 'Likes', count: counts?.likes },
    ];

    return (
        <div className="flex w-full border-b sticky top-0 bg-background/80 backdrop-blur-md z-30 overflow-x-auto no-scrollbar">
            {TABS.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => onChange(tab.id)}
                    className="relative flex flex-1 items-center justify-center px-4 py-4 text-sm font-medium transition-colors hover:bg-secondary-ui min-w-[80px]"
                >
                    <div className="flex items-center gap-1.5">
                        <span
                            className={cn(
                                activeTab === tab.id
                                    ? 'text-foreground font-bold'
                                    : 'text-secondary-foreground opacity-60',
                            )}
                        >
                            {tab.label}
                        </span>
                        {tab.count !== undefined && (
                            <span className="text-[10px] opacity-40">({tab.count})</span>
                        )}
                    </div>
                    {activeTab === tab.id && (
                        <motion.div
                            layoutId="activeTab"
                            className="absolute bottom-0 h-1 w-14 rounded-full bg-primary-ui"
                        />
                    )}
                </button>
            ))}
        </div>
    );
}

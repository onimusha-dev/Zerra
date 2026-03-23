'use client';

import React from 'react';
import MainLayout from '@/components/layout/main-layout';
import { Mail, Plus, Settings } from 'lucide-react';

export default function MessagesPage() {
    return (
        <MainLayout>
            <div className="flex h-14 items-center border-b px-4 sticky top-0 bg-background/80 backdrop-blur-md z-10 justify-between">
                <h2 className="text-xl font-bold">Messages</h2>
                <div className="flex gap-2">
                    <button className="rounded-full p-2 transition-colors hover:bg-secondary-ui">
                        <Settings className="h-5 w-5" />
                    </button>
                    <button className="rounded-full p-2 transition-colors hover:bg-secondary-ui">
                        <Plus className="h-5 w-5" />
                    </button>
                </div>
            </div>

            <div className="flex flex-col items-center justify-center h-[60vh] p-8 text-center max-w-sm mx-auto">
                <div className="h-20 w-20 rounded-full bg-secondary-ui flex items-center justify-center mb-6">
                    <Mail className="h-10 w-10 text-primary-ui opacity-40 shrink-0" />
                </div>
                <h2 className="text-3xl font-bold mb-4">Welcome to your inbox!</h2>
                <p className="text-secondary-foreground opacity-60 mb-8">
                    Drop a line, share a post, or jump into a group conversation! Start chatting by
                    sending a new message.
                </p>
                <button className="rounded-full bg-primary-ui px-8 py-3.5 font-bold text-background transition-all hover:opacity-90">
                    Write a message
                </button>
            </div>
        </MainLayout>
    );
}

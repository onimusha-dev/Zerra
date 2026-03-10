'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useProfile } from '@/hooks/useProfile';
import { IdentityDeck } from '@/components/profile/IdentityDeck';
import { ProfileContent } from '@/components/profile/ProfileContent';
import { ProfileInfo } from '@/components/profile/ProfileInfo';

export default function ProfilePage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const targetUsername = searchParams.get('username');

    const { profile, items, isLoading, isUnauthenticated, isMe } = useProfile(targetUsername);

    if (isLoading)
        return (
            <div className="flex flex-col items-center justify-center p-24 gap-4 opacity-30">
                <Loader2 className="h-8 w-8 animate-spin text-foreground" />
                <span className="text-[9px] font-bold uppercase tracking-[0.4em] italic leading-none">
                    Accessing Persona Profile
                </span>
            </div>
        );

    if (isUnauthenticated)
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center text-rose-500">
                <h2 className="text-2xl font-bold tracking-tighter mb-2 uppercase italic">
                    Identity Required
                </h2>
                <p className="text-[9px] font-bold uppercase tracking-widest opacity-60 mb-8">
                    Access Denied to this node.
                </p>
                <Button
                    onClick={() => router.push('/auth/login')}
                    variant="outline"
                    className="rounded-none font-bold text-[9px] uppercase tracking-widest px-10 h-10 bg-foreground text-background"
                >
                    Authenticate
                </Button>
            </div>
        );

    if (!profile)
        return (
            <div className="p-24 text-center opacity-20">
                <p className="text-[10px] font-bold uppercase tracking-widest">
                    Persona node not found in registry.
                </p>
            </div>
        );

    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground">
            {/* Banner & Identity Deck */}
            <IdentityDeck profile={profile} transmissionCount={items.length} isMe={isMe} />

            <div className="px-6 md:px-10">
                <ProfileInfo profile={profile} />

                <div className="mt-12">
                    <ProfileContent items={items} />
                </div>
            </div>

            <div className="pb-32" />
        </div>
    );
}

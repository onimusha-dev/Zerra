'use client';

import React, { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useProfile } from '@/hooks/useProfile';
import { IdentityDeck } from '@/components/profile/IdentityDeck';
import { ProfileContent } from '@/components/profile/ProfileContent';
import { ProfileInfo } from '@/components/profile/ProfileInfo';
import { LoadingState } from '@/components/shared/LoadingState';
import { EmptyState } from '@/components/shared/EmptyState';
import { Button } from '@/components/ui/button';

// Inner component that reads searchParams — must be inside <Suspense>
function ProfilePageInner() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const targetUsername = searchParams.get('username');
    const { profile, items, isLoading, isUnauthenticated, isMe } = useProfile(targetUsername);

    if (isLoading) return <LoadingState message="Accessing Persona Profile" />;

    if (isUnauthenticated)
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center gap-6">
                <h2 className="text-2xl font-black tracking-tighter uppercase text-rose-500">
                    Identity Required
                </h2>
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground/40">
                    Access denied to this node.
                </p>
                <Button
                    onClick={() => router.push('/auth/login')}
                    className="rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] px-10 h-10"
                >
                    Authenticate
                </Button>
            </div>
        );

    if (!profile)
        return (
            <EmptyState
                title="Persona Not Found"
                description="This node does not exist in the registry."
            />
        );

    return (
        <div className="flex flex-col min-h-screen pb-24">
            <IdentityDeck profile={profile} transmissionCount={items.length} isMe={isMe} />
            <div className="px-4 mt-2">
                <ProfileInfo profile={profile} />
                <div className="mt-6">
                    <ProfileContent items={items} />
                </div>
            </div>
        </div>
    );
}

// Outer page wraps inner in Suspense — required by Next.js for useSearchParams()
export default function ProfilePage() {
    return (
        <Suspense fallback={<LoadingState message="Accessing Persona Profile" />}>
            <ProfilePageInner />
        </Suspense>
    );
}

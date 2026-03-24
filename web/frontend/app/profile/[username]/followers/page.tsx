'use client';

import React, { useEffect } from 'react';
import MainLayout from '@/components/layout/main-layout';
import { useGetFollowers, useProfile } from '@/hooks/queries/useProfile';
import { useAuthStore } from '@/stores/useAuthStore';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import FollowingFollowersHeader from '@/components/features/profile/following-followers-header';
import ProfileCard from '@/components/features/profile/profile-card';

interface ProfilePageProps {
    params: Promise<{ username: string }>;
}

export default function Followers({ params }: ProfilePageProps) {
    const { username } = React.use(params);

    const router = useRouter();
    const { user: currentUser, isAuthenticated, _hasHydrated } = useAuthStore();

    // Fetch profile
    const { data: response, isLoading: isProfileLoading, isError } = useProfile(username);

    const profile = response?.data;

    // Fetch followers (React Query)
    const { data: followersList, isLoading: isFollowersLoading } = useGetFollowers(profile?.id!);

    // Auth redirect
    useEffect(() => {
        if (_hasHydrated && !isAuthenticated) {
            router.push('/auth/login');
        }
    }, [_hasHydrated, isAuthenticated, router]);

    const isOwn = currentUser?.username === username;

    if (!_hasHydrated || isProfileLoading || isFollowersLoading) {
        return (
            <MainLayout>
                <div className="flex h-screen items-center justify-center">
                    <Loader2 className="h-10 w-10 animate-spin text-primary-ui" />
                </div>
            </MainLayout>
        );
    }

    if (isError || !profile) {
        return (
            <MainLayout>
                <div className="flex flex-col items-center justify-center h-[50vh] p-8 text-center">
                    <h2 className="text-2xl font-bold mb-2">This account doesn&apos;t exist</h2>
                    <p className="text-secondary-foreground opacity-60">
                        Try searching for another.
                    </p>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <FollowingFollowersHeader profile={profile} isOwn={isOwn} headerType="followers" />

            <div className="flex flex-col mt-5 mb-15">
                {followersList?.length === 0 && (
                    <p className="text-center opacity-60">No followers yet</p>
                )}

                {followersList?.map((follower) => (
                    <ProfileCard
                        key={follower.id}
                        profile={follower}
                        username={follower.username}
                    />
                ))}
            </div>
        </MainLayout>
    );
}

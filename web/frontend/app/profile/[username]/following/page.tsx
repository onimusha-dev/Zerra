'use client';

import React, { useEffect } from 'react';
import MainLayout from '@/components/layout/main-layout';
import { useProfile, useGetFollowing } from '@/hooks/queries/useProfile';
import { useUserPosts, useUserArticles } from '@/hooks/queries/useUserContent';
import { useAuthStore } from '@/stores/useAuthStore';
import { useUserLikes } from '@/hooks/queries/useUserLikes';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import FollowingFollowersHeader from '@/components/features/profile/following-followers-header';
import ProfileCard from '@/components/features/profile/profile-card';

interface ProfilePageProps {
    params: Promise<{ username: string }>;
}

export default function Following({ params }: ProfilePageProps) {
    const { username } = React.use(params);
    const { data: response, isLoading: isProfileLoading, isError } = useProfile(username);
    const { user: currentUser, isAuthenticated, _hasHydrated } = useAuthStore();
    const router = useRouter();

    const profile = response?.data;
    const { data: followingList, isLoading: isFollowingLoading } = useGetFollowing(profile?.id!);

    useEffect(() => {
        if (_hasHydrated && !isAuthenticated) {
            router.push('/auth/login');
        }
    }, [_hasHydrated, isAuthenticated, router]);

    if (!_hasHydrated || isProfileLoading || isFollowingLoading) {
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

    const isOwn = currentUser?.username === username;

    return (
        <MainLayout>
            <FollowingFollowersHeader profile={profile} isOwn={isOwn} headerType="following" />
            <div className="flex flex-col mt-5 mb-15">
                {followingList?.length === 0 && (
                    <p className="text-center opacity-60">Not following anyone yet</p>
                )}
                {followingList?.map((followingUser) => (
                    <ProfileCard
                        key={followingUser.id}
                        profile={followingUser}
                        username={followingUser.username}
                    />
                ))}
            </div>
        </MainLayout>
    );
}

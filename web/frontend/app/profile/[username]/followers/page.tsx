'use client';

import React, { useEffect, useState } from 'react';
import MainLayout from '@/components/layout/main-layout';
import { useProfile } from '@/hooks/queries/useProfile';
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

export default function Followers({ params }: ProfilePageProps) {
    const { username } = React.use(params);
    const { data: response, isLoading: isProfileLoading, isError } = useProfile(username);
    const { user: currentUser, isAuthenticated, _hasHydrated } = useAuthStore();
    const router = useRouter();

    const [activeTab, setActiveTab] = useState('posts');

    const profile = response?.data;
    const posts = useUserPosts(profile?.id, { enabled: activeTab === 'posts' });
    const articles = useUserArticles(profile?.id, { enabled: activeTab === 'articles' });
    const likes = useUserLikes(username, profile?.id, { enabled: activeTab === 'likes' });

    const allPosts = posts.data?.pages.flat() || [];
    const allArticles = articles.data?.pages.flat() || [];
    const allLikes = likes.data?.pages.flat() || [];

    useEffect(() => {
        if (_hasHydrated && !isAuthenticated) {
            router.push('/auth/login');
        }
    }, [_hasHydrated, isAuthenticated, router]);

    if (!_hasHydrated || isProfileLoading) {
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
            <FollowingFollowersHeader profile={profile} isOwn={isOwn} headerType="followers" />
            <div className="flex flex-col mt-5 mb-15">
                {Array(10)
                    .fill(0)
                    .map((item, key) => (
                        <ProfileCard profile={profile} key={key} username={profile.username} />
                    ))}
            </div>
        </MainLayout>
    );
}

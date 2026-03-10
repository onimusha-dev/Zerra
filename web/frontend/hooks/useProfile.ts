import { useState, useEffect } from 'react';
import { fetchApi } from '@/lib/api';
import { FeedItem as FeedItemType } from '@/types';
import { useUser } from './useUser';

export interface UserProfile {
    id: string;
    name: string;
    username: string;
    email: string;
    bio?: string;
    location?: string;
    link?: string;
    avatar?: string;
    banner?: string;
    timezone?: string;
    createdAt?: string;
    followersCount?: number;
    followingCount?: number;
    isFollowing?: boolean;
}

export function useProfile(username: string | null) {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [items, setItems] = useState<FeedItemType[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUnauthenticated, setIsUnauthenticated] = useState(false);
    const [isMe, setIsMe] = useState(false);
    const { user: currentUser } = useUser();

    useEffect(() => {
        fetchProfileAndData();
    }, [username, currentUser?.id]);

    async function fetchProfileAndData() {
        setIsLoading(true);
        try {
            const endpoint = username ? `/api/users/profile/username/${username}` : '/api/users/me';

            const profileRes = await fetchApi(endpoint);

            if (!profileRes.ok) {
                if (profileRes.status === 401 && !username) setIsUnauthenticated(true);
                return;
            }

            const profileResult = await profileRes.json();
            if (!profileResult.success) throw new Error('Profile retrieval failed');

            const userProfile = profileResult.data;
            setProfile(userProfile);

            // Determine if it's the current user's profile
            if (!username || (currentUser && currentUser.id === userProfile.id)) {
                setIsMe(true);
            } else {
                setIsMe(false);
            }

            // Fetch user's content (all content then filter for this user)
            const [postsRes, articlesRes] = await Promise.all([
                fetchApi('/api/posts/'),
                fetchApi('/api/articles/'),
            ]);

            if (postsRes.ok && articlesRes.ok) {
                const [postsData, articlesData] = await Promise.all([
                    postsRes.json(),
                    articlesRes.json(),
                ]);

                const combined: FeedItemType[] = [
                    ...(postsData.data || []).map((p: any) => ({ ...p, type: 'post' as const })),
                    ...(articlesData.data || []).map((a: any) => ({
                        ...a,
                        type: 'article' as const,
                    })),
                ]
                    .filter((item) => {
                        const author = (item as any).author || (item as any).user;
                        return author?.id === userProfile.id;
                    })
                    .sort((a, b) => {
                        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                        return timeB - timeA;
                    });

                setItems(combined);
            }
        } catch (err) {
            console.error('Profile sync failure', err);
        } finally {
            setIsLoading(false);
        }
    }

    return {
        profile,
        items,
        isLoading,
        isUnauthenticated,
        isMe,
        refresh: fetchProfileAndData,
    };
}

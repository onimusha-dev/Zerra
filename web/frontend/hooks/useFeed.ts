'use client';

import { useState, useEffect } from 'react';
import { fetchApi } from '@/lib/api';
import { FeedItem } from '@/types';

/**
 * Fetches and manages the home feed (posts + articles merged and sorted).
 * Post creation is handled separately by useCreatePost.
 */
export function useFeed() {
    const [items, setItems] = useState<FeedItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchFeed();
    }, []);

    async function fetchFeed() {
        setIsLoading(true);
        try {
            const [postsRes, articlesRes] = await Promise.all([
                fetchApi('/api/posts/'),
                fetchApi('/api/articles/'),
            ]);

            if (!postsRes.ok || !articlesRes.ok) {
                throw new Error('Feed sync failed');
            }

            const [postsData, articlesData] = await Promise.all([
                postsRes.json(),
                articlesRes.json(),
            ]);

            const combined: FeedItem[] = [
                ...(postsData.data || []).map((p: any) => ({ ...p, type: 'post' as const })),
                ...(articlesData.data || []).map((a: any) => ({ ...a, type: 'article' as const })),
            ].sort((a, b) => {
                const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                return timeB - timeA;
            });

            setItems(combined);
        } catch (err) {
            setError('Failed to load feed.');
        } finally {
            setIsLoading(false);
        }
    }

    /** Prepend a newly created item to the feed without a full refetch. */
    function prependItem(item: FeedItem) {
        setItems((prev) => [item, ...prev]);
    }

    return { items, isLoading, error, fetchFeed, prependItem };
}

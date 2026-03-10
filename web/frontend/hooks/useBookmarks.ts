'use client';

import { useState, useEffect } from 'react';
import { fetchApi } from '@/lib/api';
import { FeedItemType } from '@/components/FeedItem';

export function useBookmarks() {
    const [items, setItems] = useState<FeedItemType[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchBookmarks();
    }, []);

    async function fetchBookmarks() {
        setIsLoading(true);
        try {
            // Attempt to fetch from a dedicated bookmarks endpoint
            // If it fails, fallback to fetching all and filtering (legacy pattern)
            const res = await fetchApi('/api/bookmarks');

            if (res.ok) {
                const result = await res.json();
                if (result.success) {
                    setItems(result.data || []);
                    return;
                }
            }

            // Fallback: Fetch everything and filter locally if endpoint doesn't exist
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
                    .filter((item) => item.bookmarked)
                    .sort((a, b) => {
                        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                        return timeB - timeA;
                    });

                setItems(combined);
            } else {
                setError('Failed to load bookmarks.');
            }
        } catch (err) {
            setError('Failed to sync bookmarks.');
        } finally {
            setIsLoading(false);
        }
    }

    return { items, isLoading, error, refresh: fetchBookmarks };
}

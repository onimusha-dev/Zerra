import { useState, useEffect } from 'react';
import { fetchApi } from '@/lib/api';
import { FeedItemType } from '@/components/FeedItem';
import { useUser } from './useUser';

export function useFeed() {
    const [items, setItems] = useState<FeedItemType[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isPosting, setIsPosting] = useState(false);
    const [content, setContent] = useState('');
    const [banner, setBanner] = useState('');
    const [error, setError] = useState<string | null>(null);
    const { user, isLoading: isUserLoading } = useUser();

    useEffect(() => {
        fetchFeed();
    }, []);

    async function fetchFeed() {
        try {
            const [postsRes, articlesRes] = await Promise.all([
                fetchApi('/api/posts/'),
                fetchApi('/api/articles/'),
            ]);

            if (!postsRes.ok || !articlesRes.ok) {
                throw new Error(`Feed sync failed`);
            }

            const [postsData, articlesData] = await Promise.all([
                postsRes.json(),
                articlesRes.json(),
            ]);

            const combined: FeedItemType[] = [
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

    async function handleCreatePost() {
        if (!content.trim()) return;
        setIsPosting(true);
        setError(null);
        try {
            const res = await fetchApi('/api/posts/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    content,
                    banner: banner.trim() || undefined,
                }),
            });

            const result = await res.json();
            if (result.success) {
                setItems([{ ...result.data, author: user, type: 'post' }, ...items]);
                setContent('');
                setBanner('');
            } else {
                throw new Error(result.message || 'Failed to create post.');
            }
        } catch (err: any) {
            setError(err.message || 'Failed to post.');
        } finally {
            setIsPosting(false);
        }
    }

    return {
        items,
        isLoading,
        isPosting,
        content,
        setContent,
        banner,
        setBanner,
        error,
        user,
        handleCreatePost,
        fetchFeed,
    };
}

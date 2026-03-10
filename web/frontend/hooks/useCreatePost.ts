'use client';

import { useState } from 'react';
import { fetchApi } from '@/lib/api';
import { FeedItem } from '@/types';
import { useUser } from './useUser';

/**
 * Handles creating a new post.
 * Split from useFeed so the home feed's data-fetching concern is separate
 * from the mutation concern.
 */
export function useCreatePost(onSuccess?: (newItem: FeedItem) => void) {
    const [isPosting, setIsPosting] = useState(false);
    const [content, setContent] = useState('');
    const [banner, setBanner] = useState('');
    const [error, setError] = useState<string | null>(null);
    const { user } = useUser();

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
                const newPost: FeedItem = { ...result.data, author: user, type: 'post' };
                onSuccess?.(newPost);
                setContent('');
                setBanner('');
            } else {
                throw new Error(result.message || 'Failed to create post.');
            }
        } catch (err: any) {
            setError(err.message || 'Broadcast failed.');
        } finally {
            setIsPosting(false);
        }
    }

    return { content, setContent, banner, setBanner, isPosting, error, handleCreatePost };
}

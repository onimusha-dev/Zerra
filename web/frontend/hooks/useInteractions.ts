'use client';

import { useState } from 'react';
import { fetchApi } from '@/lib/api';

type ItemType = 'post' | 'article';

export function useInteractions(
    itemId: string,
    type: ItemType,
    initialLiked = false,
    initialBookmarked = false,
) {
    const [liked, setLiked] = useState(initialLiked);
    const [bookmarked, setBookmarked] = useState(initialBookmarked);
    const [isLiking, setIsLiking] = useState(false);
    const [isBookmarking, setIsBookmarking] = useState(false);
    const [likesCount, setLikesCount] = useState(0); // This should probably be handled by the parent if we want reactivity, or passed in.

    const toggleLike = async (e?: React.MouseEvent, onSuccess?: (liked: boolean) => void) => {
        e?.preventDefault();
        if (isLiking) return;
        setIsLiking(true);
        try {
            const endpoint =
                type === 'post' ? `/api/posts/${itemId}/like` : `/api/articles/${itemId}/like`;
            const res = await fetchApi(endpoint, { method: 'POST' });
            if (res.ok) {
                setLiked(!liked);
                onSuccess?.(!liked);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsLiking(false);
        }
    };

    const toggleBookmark = async (
        e?: React.MouseEvent,
        onSuccess?: (bookmarked: boolean) => void,
    ) => {
        e?.preventDefault();
        if (isBookmarking) return;
        setIsBookmarking(true);
        try {
            const endpoint =
                type === 'post'
                    ? `/api/posts/${itemId}/bookmark`
                    : `/api/articles/${itemId}/bookmark`;
            const res = await fetchApi(endpoint, { method: 'POST' });
            if (res.ok) {
                setBookmarked(!bookmarked);
                onSuccess?.(!bookmarked);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsBookmarking(false);
        }
    };

    return {
        liked,
        bookmarked,
        isLiking,
        isBookmarking,
        toggleLike,
        toggleBookmark,
    };
}

import { useState, useEffect } from 'react';
import { fetchApi } from '@/lib/api';
import { Comment } from '@/components/comments/types';

export function useComments(postId?: string, articleId?: string) {
    const [comments, setComments] = useState<Comment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [newComment, setNewComment] = useState('');
    const [isPosting, setIsPosting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchComments();
    }, [postId, articleId]);

    async function fetchComments() {
        setIsLoading(true);
        try {
            const endpoint = postId
                ? `/api/comments/post/${postId}`
                : `/api/comments/article/${articleId}`;
            const res = await fetchApi(endpoint);
            if (res.ok) {
                const result = await res.json();
                setComments(result.data || []);
            }
        } catch (err) {
            console.error('Failed to load comments', err);
        } finally {
            setIsLoading(false);
        }
    }

    async function handlePostComment() {
        if (!newComment.trim()) return;
        setIsPosting(true);
        try {
            const res = await fetchApi('/api/comments/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    content: newComment,
                    postId: postId ? parseInt(postId) : undefined,
                    articleId: articleId ? parseInt(articleId) : undefined,
                }),
            });
            if (res.ok) {
                const result = await res.json();
                if (result.success) {
                    setComments([result.data, ...comments]);
                    setNewComment('');
                }
            }
        } catch (err) {
            setError('Synchronization failure.');
        } finally {
            setIsPosting(false);
        }
    }

    return {
        comments,
        isLoading,
        newComment,
        setNewComment,
        isPosting,
        error,
        handlePostComment,
        fetchComments,
    };
}

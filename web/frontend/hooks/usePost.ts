import { useState, useEffect } from 'react';
import { fetchApi } from '@/lib/api';

export interface Post {
    id: string;
    content: string;
    media?: string;
    banner?: string;
    createdAt: string;
    author: {
        name: string;
        username: string;
        avatar?: string;
    };
}

export function usePost(id: string | undefined) {
    const [post, setPost] = useState<Post | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (id) fetchPost();
    }, [id]);

    async function fetchPost() {
        setIsLoading(true);
        try {
            const res = await fetchApi(`/api/posts/${id}`);
            if (!res.ok) throw new Error('Transmission not found.');
            const result = await res.json();
            if (result.success) {
                setPost(result.data);
            } else {
                throw new Error(result.message);
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }

    return { post, isLoading, error, refresh: fetchPost };
}

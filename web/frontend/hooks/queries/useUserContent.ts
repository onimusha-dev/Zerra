import { useInfiniteQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Post, Article } from '@/types/feed';

interface QueryOptions {
    enabled?: boolean;
}

export const useUserPosts = (userId: number | undefined, options: QueryOptions = {}) => {
    const limit = 10;
    return useInfiniteQuery({
        queryKey: ['user-posts', userId],
        initialPageParam: undefined as number | undefined,
        queryFn: async ({ pageParam }) => {
            if (!userId) return [];

            try {
                const { data } = await api.get(`/posts/author/${userId}`, {
                    params: { limit, cursor: pageParam },
                });
                if (data.status === 'success' || data.success) {
                    return data.data as Post[];
                }
            } catch (error) {
                console.error('Error fetching user posts:', error);
            }
            return [];
        },
        getNextPageParam: (lastPage) => {
            if (!lastPage || lastPage.length < limit) return undefined;
            return lastPage[lastPage.length - 1].id;
        },
        enabled: !!userId && options.enabled !== false,
    });
};

export const useUserArticles = (userId: number | undefined, options: QueryOptions = {}) => {
    const limit = 10;
    return useInfiniteQuery({
        queryKey: ['user-articles', userId],
        initialPageParam: undefined as number | undefined,
        queryFn: async ({ pageParam }) => {
            if (!userId) return [];

            try {
                const { data } = await api.get(`/articles/user/${userId}`, {
                    params: { limit, cursor: pageParam },
                });
                if (data.status === 'success' || data.success) {
                    return data.data as Article[];
                }
            } catch (error) {
                console.error('Error fetching user articles:', error);
            }
            return [];
        },
        getNextPageParam: (lastPage) => {
            if (!lastPage || lastPage.length < limit) return undefined;
            return lastPage[lastPage.length - 1].id;
        },
        enabled: !!userId && options.enabled !== false,
    });
};

export type UserFeedItem = { type: 'post'; data: Post } | { type: 'article'; data: Article };

export const useUserFeed = (userId: number | undefined, options: QueryOptions = {}) => {
    const limit = 10;
    return useInfiniteQuery({
        queryKey: ['user-feed', userId],
        initialPageParam: undefined as number | undefined,
        queryFn: async ({ pageParam }) => {
            if (!userId) return [];

            const [postsRes, articlesRes] = await Promise.all([
                api
                    .get(`/posts/author/${userId}`, { params: { limit, cursor: pageParam } })
                    .catch(() => ({ data: { success: false, data: [] } })),
                api
                    .get(`/articles/user/${userId}`, { params: { limit, cursor: pageParam } })
                    .catch(() => ({ data: { success: false, data: [] } })),
            ]);

            const items: UserFeedItem[] = [];

            if (
                (postsRes.data?.success || postsRes.data?.status === 'success') &&
                Array.isArray(postsRes.data.data)
            ) {
                postsRes.data.data.forEach((post: Post) => {
                    items.push({ type: 'post', data: post });
                });
            }

            if (
                (articlesRes.data?.success || articlesRes.data?.status === 'success') &&
                Array.isArray(articlesRes.data.data)
            ) {
                articlesRes.data.data.forEach((article: Article) => {
                    items.push({ type: 'article', data: article });
                });
            }

            return items.sort((a, b) => {
                const dateA = new Date(a.data.createdAt).getTime();
                const dateB = new Date(b.data.createdAt).getTime();
                return dateB - dateA;
            });
        },
        getNextPageParam: (lastPage) => {
            if (lastPage.length < 2) return undefined;
            // This is tricky for mixed feed with cursor, but we'll use the last item's id if it exists
            // though different types might have same IDs. Ideally the backend should handle mixed feed.
            return lastPage[lastPage.length - 1].data.id;
        },
        enabled: !!userId && options.enabled !== false,
    });
};

// For backward compatibility
export const useUserContent = (userId: number | undefined) => {
    const posts = useUserPosts(userId);
    const articles = useUserArticles(userId);
    return { posts, articles };
};

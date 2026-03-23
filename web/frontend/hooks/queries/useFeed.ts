import { useInfiniteQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Post, Article } from '@/types/feed';

export type FeedItem = { type: 'post'; data: Post } | { type: 'article'; data: Article };

export const useFeed = () => {
    const limit = 10;
    return useInfiniteQuery({
        queryKey: ['feed', 'for-you'],
        initialPageParam: undefined as number | undefined,
        queryFn: async ({ pageParam }) => {
            const [postsRes, articlesRes] = await Promise.all([
                api
                    .get('/posts/for-you', { params: { limit, cursor: pageParam } })
                    .catch(() => ({ data: { success: false, data: [] } })),
                api
                    .get('/articles/for-you', { params: { limit, cursor: pageParam } })
                    .catch(() => ({ data: { success: false, data: [] } })),
            ]);

            const items: FeedItem[] = [];

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

            // Shuffle array to mix the elements
            for (let i = items.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [items[i], items[j]] = [items[j], items[i]];
            }

            return items;
        },
        getNextPageParam: (lastPage) => {
            if (lastPage.length < 2) return undefined;
            return lastPage[lastPage.length - 1].data.id;
        },
    });
};

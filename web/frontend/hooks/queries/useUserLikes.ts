import { useInfiniteQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Post, Article } from '@/types/feed';

export type LikedItem =
    | { likeId: number; type: 'post'; data: Post }
    | { likeId: number; type: 'article'; data: Article };

interface QueryOptions {
    enabled?: boolean;
}

export const useUserLikes = (
    username: string | undefined,
    userId?: number,
    options: QueryOptions = {},
) => {
    const limit = 10;
    return useInfiniteQuery({
        queryKey: ['user-likes', username, userId],
        initialPageParam: undefined as number | undefined,
        queryFn: async ({ pageParam }) => {
            if (!username && !userId) return [];

            const endpoints = [];
            if (username) endpoints.push(`/users/profile/username/${username}/likes`);
            if (userId) endpoints.push(`/users/profile/${userId}/likes`);

            for (const endpoint of endpoints) {
                try {
                    const { data } = await api.get(endpoint, {
                        params: { limit, cursor: pageParam },
                    });

                    if (data.status === 'success' || data.success) {
                        const rawItems = data.data;
                        if (!Array.isArray(rawItems)) continue;

                        return rawItems
                            .map((item: any) => {
                                if (item.type && item.data) return item as LikedItem;
                                if (item.content) return { type: 'post', data: item } as LikedItem;
                                if (item.title || item.body)
                                    return { type: 'article', data: item } as LikedItem;
                                return null;
                            })
                            .filter(Boolean) as LikedItem[];
                    }
                } catch (e) {
                    console.error(`Error fetching likes from ${endpoint}:`, e);
                }
            }

            return [];
        },
        getNextPageParam: (lastPage) => {
            if (!lastPage || lastPage.length < limit) return undefined;
            return lastPage[lastPage.length - 1].likeId;
        },
        enabled: (!!username || !!userId) && options.enabled !== false,
    });
};

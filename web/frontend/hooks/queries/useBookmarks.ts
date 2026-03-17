import { useInfiniteQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { BookmarkItem } from '@/types/feed';

export const useBookmarks = () => {
    const limit = 10;
    return useInfiniteQuery({
        queryKey: ['bookmarks'],
        initialPageParam: 0,
        queryFn: async ({ pageParam = 0 }) => {
            const offset = typeof pageParam === 'number' ? pageParam * limit : 0;

            try {
                const { data } = await api.get(`/users/me/bookmarks`, {
                    params: { limit, offset },
                });

                if (data.success || data.status === 'success') {
                    return data.data as BookmarkItem[];
                }
            } catch (error) {
                console.error('Error fetching bookmarks:', error);
            }
            return [];
        },
        getNextPageParam: (lastPage, allPages) => {
            if (!lastPage || lastPage.length < limit) return undefined;
            return allPages.length;
        },
    });
};

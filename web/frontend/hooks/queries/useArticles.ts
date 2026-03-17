import { useInfiniteQuery, useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Article } from '@/types/feed';

export const useArticles = () => {
    const limit = 10;
    return useInfiniteQuery({
        queryKey: ['articles'],
        initialPageParam: 0,
        queryFn: async ({ pageParam = 0 }) => {
            const offset = typeof pageParam === 'number' ? pageParam * limit : 0;

            try {
                const { data } = await api.get('/articles', {
                    params: { limit, offset },
                });
                if (data.success || data.status === 'success') {
                    return data.data as Article[];
                }
            } catch (error) {
                console.error('Error fetching articles:', error);
            }
            return [];
        },
        getNextPageParam: (lastPage, allPages) => {
            if (!lastPage || lastPage.length < limit) return undefined;
            return allPages.length;
        },
    });
};

export const useDeleteArticle = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (articleId: number) => {
            const res = await api.delete(`/articles/${articleId}`);
            return res.data;
        },
        onSuccess: async () => {
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: ['feed', 'for-you'] }),
                queryClient.invalidateQueries({ queryKey: ['articles'] }),
            ]);
        },
    });
};

export const useArticle = (articleId: number) => {
    return useQuery({
        queryKey: ['article', articleId],
        queryFn: async () => {
            const { data } = await api.get(`/articles/${articleId}`);
            if (data.success || data.status === 'success') {
                return data.data as Article;
            }
            throw new Error(data.message || 'Failed to fetch article');
        },
        enabled: !!articleId,
    });
};

export const useCreateArticle = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: {
            title: string;
            body: string;
            published?: boolean;
            banner?: File;
            enableComments?: boolean;
        }) => {
            const formData = new FormData();
            formData.append('title', data.title);
            formData.append('body', data.body);

            if (data.published !== undefined) {
                formData.append('published', data.published ? '1' : '0');
            }
            if (data.enableComments !== undefined) {
                formData.append('enableComments', data.enableComments ? '1' : '0');
            }

            if (data.banner) {
                formData.append('banner', data.banner);
            }

            const res = await api.post('/articles', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return res.data;
        },
        onSuccess: async () => {
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: ['feed', 'for-you'] }),
                queryClient.invalidateQueries({ queryKey: ['articles'] }),
            ]);
        },
    });
};
export const useUpdateArticle = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            articleId,
            title,
            body,
            published,
            banner,
        }: {
            articleId: number;
            title?: string;
            body?: string;
            published?: boolean;
            banner?: File;
        }) => {
            const formData = new FormData();
            if (title) formData.append('title', title);
            if (body) formData.append('body', body);
            if (published !== undefined) formData.append('published', published ? '1' : '0');

            if (banner) formData.append('banner', banner);

            const res = await api.patch(`/articles/${articleId}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            if (res.data.status === 'error' || !res.data.success) {
                throw new Error(res.data.message || 'Failed to update article');
            }
            return res.data;
        },
        onSuccess: async (_, variables) => {
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: ['feed', 'for-you'] }),
                queryClient.invalidateQueries({ queryKey: ['articles'] }),
                queryClient.invalidateQueries({ queryKey: ['article', variables.articleId] }),
            ]);
        },
    });
};

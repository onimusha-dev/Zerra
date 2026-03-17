import { useInfiniteQuery, useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Post } from '@/types/feed';

export const usePosts = () => {
    const limit = 10;
    return useInfiniteQuery({
        queryKey: ['posts'],
        initialPageParam: 0,
        queryFn: async ({ pageParam = 0 }) => {
            const offset = typeof pageParam === 'number' ? pageParam * limit : 0;

            try {
                const { data } = await api.get('/posts', {
                    params: { limit, offset },
                });
                if (data.success || data.status === 'success') {
                    return data.data as Post[];
                }
            } catch (error) {
                console.error('Error fetching posts:', error);
            }
            return [];
        },
        getNextPageParam: (lastPage, allPages) => {
            if (!lastPage || lastPage.length < limit) return undefined;
            return allPages.length;
        },
    });
};

export const usePost = (postId: number) => {
    return useQuery({
        queryKey: ['post', postId],
        queryFn: async () => {
            const { data } = await api.get(`/posts/${postId}`);
            if (data.success || data.status === 'success') {
                return data.data as Post;
            }
            throw new Error(data.message || 'Failed to fetch post');
        },
        enabled: !!postId,
    });
};

export const useCreatePost = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: { content: string; published?: boolean; media?: File }) => {
            const formData = new FormData();
            formData.append('content', data.content);
            if (data.published !== undefined) {
                formData.append('published', String(!!data.published));
            }

            if (data.media) {
                formData.append('media', data.media);
            }

            const res = await api.post('/posts', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            if (res.data.status === 'error' || !res.data.success) {
                throw new Error(res.data.message || 'Failed to create post');
            }
            return res.data;
        },
        onSuccess: async () => {
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: ['feed', 'for-you'] }),
                queryClient.invalidateQueries({ queryKey: ['posts'] }),
            ]);
        },
    });
};

export const useDeletePost = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (postId: number) => {
            const res = await api.delete(`/posts/${postId}`);
            return res.data;
        },
        onSuccess: async () => {
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: ['feed', 'for-you'] }),
                queryClient.invalidateQueries({ queryKey: ['posts'] }),
                queryClient.invalidateQueries({ queryKey: ['articles'] }),
            ]);
        },
    });
};

export const useUpdatePost = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            postId,
            content,
            published,
        }: {
            postId: number;
            content: string;
            published?: boolean;
        }) => {
            const res = await api.patch(`/posts/${postId}`, { content, published });

            if (res.data.status === 'error' || !res.data.success) {
                throw new Error(res.data.message || 'Failed to update post');
            }
            return res.data;
        },
        onSuccess: async (_, variables) => {
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: ['feed', 'for-you'] }),
                queryClient.invalidateQueries({ queryKey: ['posts'] }),
                queryClient.invalidateQueries({ queryKey: ['post', variables.postId] }),
            ]);
        },
    });
};

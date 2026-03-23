import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

export interface Comment {
    id: number;
    content: string;
    createdAt: string;
    updatedAt: string;
    authorId: number;
    postId?: number;
    articleId?: number;
    author: {
        id: number;
        username: string;
        name: string;
        avatar?: string;
    };
    _count?: {
        likes?: number;
        replies?: number;
    };
}

export const usePostComments = (postId: number) => {
    return useQuery({
        queryKey: ['comments', 'post', postId],
        queryFn: async () => {
            const { data } = await api.get(`/comments/post/${postId}`);
            if (data.success || data.status === 'success') {
                return data.data as Comment[];
            }
            throw new Error(data.message || 'Failed to fetch post comments');
        },
        enabled: !!postId,
    });
};

export const useArticleComments = (articleId: number) => {
    return useQuery({
        queryKey: ['comments', 'article', articleId],
        queryFn: async () => {
            const { data } = await api.get(`/comments/article/${articleId}`);
            if (data.success || data.status === 'success') {
                return data.data as Comment[];
            }
            throw new Error(data.message || 'Failed to fetch article comments');
        },
        enabled: !!articleId,
    });
};

export const useCreateComment = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            content,
            postId,
            articleId,
        }: {
            content: string;
            postId?: number;
            articleId?: number;
        }) => {
            const { data } = await api.post('/comments', { content, postId, articleId });
            if (data.success || data.status === 'success') {
                return data.data as Comment;
            }
            throw new Error(data.message || 'Failed to create comment');
        },
        onSuccess: async (_, variables) => {
            const promises = [];
            if (variables.postId) {
                promises.push(
                    queryClient.invalidateQueries({
                        queryKey: ['comments', 'post', variables.postId],
                    }),
                );
                promises.push(
                    queryClient.invalidateQueries({ queryKey: ['post', variables.postId] }),
                ); // Update post reply count
            }
            if (variables.articleId) {
                promises.push(
                    queryClient.invalidateQueries({
                        queryKey: ['comments', 'article', variables.articleId],
                    }),
                );
            }
            await Promise.all(promises);
        },
    });
};

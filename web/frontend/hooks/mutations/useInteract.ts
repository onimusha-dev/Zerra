import { useMutation } from '@tanstack/react-query';
import api from '@/lib/api';

export const useInteract = (type: 'posts' | 'articles' | 'comments') => {
    const toggleLike = useMutation({
        mutationFn: async (id: number) => {
            const res = await api.post(`/${type}/${id}/like`);
            if (!res.data || (res.data.status !== 'success' && !res.data.success)) {
                throw new Error('Failed to like');
            }
            return res.data;
        },
    });

    const toggleBookmark = useMutation({
        mutationFn: async (id: number) => {
            const res = await api.post(`/${type}/${id}/bookmark`);
            if (!res.data || (res.data.status !== 'success' && !res.data.success)) {
                throw new Error('Failed to bookmark');
            }
            return res.data;
        },
    });

    return { toggleLike, toggleBookmark };
};

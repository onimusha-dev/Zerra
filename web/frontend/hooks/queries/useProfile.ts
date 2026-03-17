'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { ProfileResponse } from '@/types/user';

export const profileKeys = {
    all: ['profile'] as const,
    byUsername: (username: string) => [...profileKeys.all, 'username', username] as const,
    byId: (id: string) => [...profileKeys.all, 'id', id] as const,
};

export const useProfile = (username: string) => {
    return useQuery({
        queryKey: profileKeys.byUsername(username),
        queryFn: async () => {
            console.log(`[useProfile] Fetching profile for: ${username}`);
            const response = await api.get<ProfileResponse>(`/users/profile/username/${username}`);
            console.log(
                `[useProfile] RAW Response for ${username}:`,
                JSON.stringify(response.data, null, 2),
            );
            return response.data;
        },
        enabled: !!username,
    });
};

export const useUpdateProfile = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: {
            name?: string;
            bio?: string;
            link?: string;
            avatar?: File;
            banner?: File;
        }) => {
            const formData = new FormData();
            if (data.name) formData.append('name', data.name);
            if (data.bio !== undefined) formData.append('bio', data.bio);
            if (data.link !== undefined) formData.append('link', data.link);
            if (data.avatar) formData.append('avatar', data.avatar);
            if (data.banner) formData.append('banner', data.banner);

            const response = await api.patch<{
                status: string;
                message: string;
                data: ProfileResponse['data'];
            }>('/users/me', formData, { headers: { 'Content-Type': 'multipart/form-data' } });

            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: profileKeys.all });
        },
    });
};

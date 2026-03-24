'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { FollowersResponse, ProfileResponse } from '@/types/user';
import { useAuthStore } from '@/stores/useAuthStore';

export const profileKeys = {
    all: ['profile'] as const,
    byUsername: (username: string) => [...profileKeys.all, 'username', username] as const,
    byId: (id: string) => [...profileKeys.all, 'id', id] as const,
    followers: (id: number) => [...profileKeys.all, 'followers', id] as const,
    following: (id: number) => [...profileKeys.all, 'following', id] as const,
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

export const useGetFollowers = (id: number) => {
    return useQuery({
        queryKey: profileKeys.followers(id),

        queryFn: async () => {
            const url = `/users/followers/${id}`;
            console.log(`[useGetFollowers] Fetching from: ${url}`);

            const response = await api.get<any>(url);

            console.log(`[useGetFollowers] RAW Response:`, response.data);

            const followers = response.data?.data || response.data || [];
            return Array.isArray(followers) ? followers : [];
        },

        enabled: !!id, // prevents invalid calls
    });
};

export const useGetFollowing = (id: number) => {
    return useQuery({
        queryKey: profileKeys.following(id),

        queryFn: async () => {
            const url = `/users/following/${id}`;
            console.log(`[useGetFollowing] Fetching from: ${url}`);
            const response = await api.get<any>(url);
            console.log(`[useGetFollowing] RAW Response:`, response.data);

            const following = response.data?.data || response.data || [];
            return Array.isArray(following) ? following : [];
        },

        enabled: !!id,
    });
};

export const useFollow = () => {
    const queryClient = useQueryClient();
    const { user: currentUser } = useAuthStore();

    return useMutation({
        mutationFn: async (id: number) => {
            const url = `/users/follow/${id}`;
            const response = await api.post(url);
            return response.data;
        },
        onMutate: async (targetId) => {
            // Cancel outgoing refetches
            await queryClient.cancelQueries({ queryKey: profileKeys.all });

            // Snapshot the previous state
            const previousData = queryClient.getQueriesData({ queryKey: profileKeys.all });

            // Helper to update a profile object
            const updateProfileObj = (profile: any) => {
                if (!profile || profile.id !== targetId) return profile;
                return {
                    ...profile,
                    isFollowing: true,
                    followersCount: (profile.followersCount || 0) + 1,
                };
            };

            // Helper to update the viewer's following count
            const updateViewerObj = (profile: any) => {
                if (!profile || !currentUser || profile.id !== currentUser.id) return profile;
                return {
                    ...profile,
                    followingCount: (profile.followingCount || 0) + 1,
                };
            };

            // Update all matching queries
            queryClient.setQueriesData({ queryKey: profileKeys.all }, (old: any) => {
                if (!old) return old;

                // Handle Case: List of Users (Direct Array)
                if (Array.isArray(old)) {
                    return old.map((u: any) =>
                        u.id === targetId ? { ...u, isFollowing: true } : u,
                    );
                }

                // Handle Case: Response Object { status, data }
                if (old.data) {
                    // Update target profile
                    let newData = updateProfileObj(old.data);
                    // Update viewer profile
                    newData = updateViewerObj(newData);

                    // If it's a list inside data
                    if (Array.isArray(old.data)) {
                        newData = old.data.map((u: any) =>
                            u.id === targetId ? { ...u, isFollowing: true } : u,
                        );
                    }

                    return { ...old, data: newData };
                }

                return old;
            });

            return { previousData };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: profileKeys.all });
        },
    });
};

export const useUnfollow = () => {
    const queryClient = useQueryClient();
    const { user: currentUser } = useAuthStore();

    return useMutation({
        mutationFn: async (id: number) => {
            const url = `/users/unfollow/${id}`;
            const response = await api.post(url);
            return response.data;
        },
        onMutate: async (targetId) => {
            await queryClient.cancelQueries({ queryKey: profileKeys.all });
            const previousData = queryClient.getQueriesData({ queryKey: profileKeys.all });

            const updateProfileObj = (profile: any) => {
                if (!profile || profile.id !== targetId) return profile;
                return {
                    ...profile,
                    isFollowing: false,
                    followersCount: Math.max(0, (profile.followersCount || 0) - 1),
                };
            };

            const updateViewerObj = (profile: any) => {
                if (!profile || !currentUser || profile.id !== currentUser.id) return profile;
                return {
                    ...profile,
                    followingCount: Math.max(0, (profile.followingCount || 0) - 1),
                };
            };

            queryClient.setQueriesData({ queryKey: profileKeys.all }, (old: any) => {
                if (!old) return old;

                // Handle Case: List of Users (Direct Array)
                if (Array.isArray(old)) {
                    return old.map((u: any) =>
                        u.id === targetId ? { ...u, isFollowing: false } : u,
                    );
                }

                // Handle Case: Response Object { status, data }
                if (old.data) {
                    let newData = updateProfileObj(old.data);
                    newData = updateViewerObj(newData);

                    if (Array.isArray(old.data)) {
                        newData = old.data.map((u: any) =>
                            u.id === targetId ? { ...u, isFollowing: false } : u,
                        );
                    }

                    return { ...old, data: newData };
                }

                return old;
            });

            return { previousData };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: profileKeys.all });
        },
    });
};

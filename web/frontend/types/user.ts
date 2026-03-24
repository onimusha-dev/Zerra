import { User } from './auth';

export interface Profile extends User {
    followersCount: number;
    followingCount: number;
    postsCount: number;
    articlesCount: number;
    likesCount: number;
    isFollowing?: boolean;
}

export interface ProfileResponse {
    status: 'success' | 'error';
    message: string;
    data: Profile;
}

export type Follower = {
    username: string;
    name: string;
    bio: string | null;
    avatar: string | null;
    id: number;
    isVerified: boolean;
    isFollowing?: boolean;
};

export type FollowersResponse = {
    status: string;
    message: string;
    data: Follower[];
};

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

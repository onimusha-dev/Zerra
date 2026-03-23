import { User } from './auth';

export interface Post {
    id: number;
    content: string;
    media?: string;
    authorId: number;
    author: User;
    createdAt: string;
    updatedAt: string;
    published: boolean;
    liked?: boolean;

    bookmarked?: boolean;
    _count?: {
        comments: number;
        likes: number;
        bookmarks: number;
    };
}

export interface Article {
    id: number;
    title: string;
    body: string;
    banner?: string;
    authorId: number;
    author?: User;
    user?: User;
    createdAt: string;
    updatedAt: string;
    published: boolean;
    liked?: boolean;

    bookmarked?: boolean;
    _count?: {
        comments: number;
        likes: number;
        bookmarks: number;
    };
}

export type BookmarkItem = { type: 'post'; data: Post } | { type: 'article'; data: Article };

// Central type exports for the Zerra domain model.
// Import from '@/types' instead of individual component files.

// ─── Author ─────────────────────────────────────────────────────────────────
export interface Author {
    name: string;
    username: string;
    avatar?: string;
}

// ─── Counts ──────────────────────────────────────────────────────────────────
export interface ContentCounts {
    likes?: number;
    comments?: number;
    bookmarks?: number;
    replies?: number;
}

// ─── Post ────────────────────────────────────────────────────────────────────
export interface Post {
    id: string;
    content: string;
    media?: string;
    banner?: string;
    authorId: string;
    createdAt: string;
    type: 'post';
    liked?: boolean;
    bookmarked?: boolean;
    _count?: ContentCounts;
    author?: Author;
}

// ─── Article ─────────────────────────────────────────────────────────────────
export interface Article {
    id: string;
    title: string;
    body: string;
    banner?: string;
    createdAt: string;
    type: 'article';
    liked?: boolean;
    bookmarked?: boolean;
    _count?: ContentCounts;
    author?: Author;
    // Legacy field — some endpoints return `user` instead of `author`
    user?: Author;
}

// ─── Union ───────────────────────────────────────────────────────────────────
export type FeedItem = Post | Article;

// ─── User ────────────────────────────────────────────────────────────────────
export interface User {
    id: string;
    name: string;
    username: string;
    email: string;
    avatar?: string;
    bio?: string;
    location?: string;
    link?: string;
    banner?: string;
    timezone?: string;
    createdAt?: string;
}

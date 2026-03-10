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
    _count?: {
        likes?: number;
        comments?: number;
        bookmarks?: number;
        replies?: number;
    };
    author?: {
        name: string;
        username: string;
        avatar?: string;
    };
}

export interface Article {
    id: string;
    title: string;
    body: string;
    banner?: string;
    createdAt: string;
    type: 'article';
    liked?: boolean;
    bookmarked?: boolean;
    _count?: {
        likes?: number;
        comments?: number;
        bookmarks?: number;
    };
    author?: {
        name: string;
        username: string;
        avatar?: string;
    };
    user?: {
        name: string;
        username: string;
        avatar?: string;
    };
}

export type FeedItemType = Post | Article;

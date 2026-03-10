export interface Comment {
    id: string;
    content: string;
    createdAt: string;
    authorId: string;
    author: {
        name: string;
        username: string;
        avatar?: string;
    };
    _count?: {
        likes?: number;
        replies?: number;
    };
    liked?: boolean;
}

export interface CommentsProps {
    postId?: string;
    articleId?: string;
}

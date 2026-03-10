'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';
import { useComments } from '@/hooks/useComments';
import { CommentInput } from './comments/CommentInput';
import { CommentItem } from './comments/CommentItem';
import { CommentsProps } from './comments/types';

export function CommentList({ postId, articleId }: CommentsProps) {
    const { comments, isLoading, newComment, setNewComment, isPosting, handlePostComment } =
        useComments(postId, articleId);

    if (isLoading)
        return (
            <div className="flex justify-center p-8">
                <Loader2 className="h-5 w-5 animate-spin opacity-20" />
            </div>
        );

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <CommentInput
                newComment={newComment}
                setNewComment={setNewComment}
                isPosting={isPosting}
                handlePostComment={handlePostComment}
            />

            <div className="space-y-4">
                {comments.length === 0 ? (
                    <div className="text-center py-12 opacity-10">
                        <p className="text-[9px] font-bold uppercase tracking-[0.5em]">
                            No Echoes Recorded
                        </p>
                    </div>
                ) : (
                    comments.map((comment) => <CommentItem key={comment.id} comment={comment} />)
                )}
            </div>
        </div>
    );
}

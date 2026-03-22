'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/main-layout';
import { usePost } from '@/hooks/queries/usePosts';
import { usePostComments, useCreateComment } from '@/hooks/queries/useComments';
import PostCard from '@/components/features/feed/post-card';
import CommentCard from '@/components/features/feed/comment-card';
import { ArrowLeft, Loader2, User } from 'lucide-react';
import { useAuthStore } from '@/stores/useAuthStore';
import { getMediaUrl } from '@/lib/utils';
import { VerificationBadge } from '@/components/ui/verification-badge';

export default function PostPage() {
    const { id } = useParams();
    const router = useRouter();
    const postId = Number(id);
    const { user } = useAuthStore();

    const { data: post, isLoading: postLoading, error: postError } = usePost(postId);
    const { data: comments, isLoading: commentsLoading } = usePostComments(postId);
    const { mutateAsync: createComment, isPending: isCommenting } = useCreateComment();

    const [content, setContent] = useState('');

    const handleComment = async () => {
        if (!content.trim() || isCommenting) return;
        try {
            await createComment({ content, postId });
            setContent('');
        } catch (error) {
            console.error('Failed to post comment', error);
        }
    };

    return (
        <MainLayout>
            <div className="flex h-14 items-center border-b px-4 sticky top-0 bg-background/80 backdrop-blur-md z-20 gap-4">
                <button
                    onClick={() => router.back()}
                    className="rounded-full p-2 hover:bg-secondary-ui transition-colors text-foreground"
                >
                    <ArrowLeft className="h-5 w-5" />
                </button>
                <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-1">
                        <h2 className="text-xl font-bold leading-tight truncate">
                            {(post as any)?.author?.name || (post as any)?.user?.name || 'Post'}
                        </h2>
                        {((post as any)?.author?.isVerified || (post as any)?.user?.isVerified) && (
                            <VerificationBadge size={18} />
                        )}
                    </div>
                    <span className="text-sm text-secondary-foreground opacity-60">
                        Viewing Post
                    </span>
                </div>
            </div>

            <div className="flex flex-col min-h-[calc(100vh-3.5rem)]">
                {postLoading ? (
                    <div className="flex justify-center p-12">
                        <Loader2 className="h-8 w-8 animate-spin text-primary-ui" />
                    </div>
                ) : postError || !post ? (
                    <div className="flex flex-col items-center justify-center p-12 text-center">
                        <h3 className="text-xl font-bold">Post not found</h3>
                        <p className="text-secondary-foreground opacity-60 mt-2">
                            It looks like this post was deleted or does not exist.
                        </p>
                    </div>
                ) : (
                    <>
                        {/* The main post */}
                        <PostCard post={post} isDetailedView canSelect={true} />

                        {/* Reply Input Box */}
                        <div
                            id="comments"
                            className="w-full border-b p-4 flex flex-col gap-3 scroll-mt-20"
                        >
                            <div className="flex gap-3 w-full">
                                <div className="h-10 w-10 shrink-0 rounded-full bg-secondary-ui flex items-center justify-center overflow-hidden border border-border-ui">
                                    {user?.avatar ? (
                                        <img
                                            src={getMediaUrl(user.avatar)}
                                            alt="Avatar"
                                            className="h-full w-full object-cover select-none"
                                            draggable={false}
                                        />
                                    ) : (
                                        <User className="h-5 w-5 opacity-40" />
                                    )}
                                </div>
                                <div className="flex grow flex-col gap-2">
                                    <textarea
                                        value={content}
                                        onChange={(e) => setContent(e.target.value)}
                                        placeholder="Post your reply"
                                        className="w-full resize-none border-none bg-transparent text-lg outline-none placeholder:text-foreground/40 mt-1.5 focus:ring-0"
                                        rows={1}
                                        onInput={(e) => {
                                            e.currentTarget.style.height = 'auto';
                                            e.currentTarget.style.height =
                                                Math.min(e.currentTarget.scrollHeight, 200) + 'px';
                                        }}
                                    />
                                    <div className="flex w-full items-center justify-end mt-2 pt-2 border-t">
                                        <button
                                            onClick={handleComment}
                                            disabled={!content.trim() || isCommenting}
                                            className="flex items-center gap-2 rounded-full bg-primary-ui px-5 py-1.5 font-bold text-background transition-transform hover:opacity-90 active:scale-95 disabled:opacity-50 disabled:hover:opacity-50"
                                        >
                                            {isCommenting ? (
                                                <Loader2 className="h-4 w-4 animate-spin outline-none" />
                                            ) : (
                                                'Reply'
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Comments List */}
                        {commentsLoading ? (
                            <div className="flex justify-center p-8">
                                <Loader2 className="h-6 w-6 animate-spin text-primary-ui opacity-50" />
                            </div>
                        ) : comments && comments.length > 0 ? (
                            <div className="flex flex-col pb-20">
                                {comments.map((comment, index) => (
                                    <CommentCard key={comment.id || index} comment={comment} />
                                ))}
                            </div>
                        ) : (
                            <div className="p-8 text-center text-sm font-medium text-foreground/40">
                                No replies yet
                            </div>
                        )}
                    </>
                )}
            </div>
        </MainLayout>
    );
}

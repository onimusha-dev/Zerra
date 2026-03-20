'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/main-layout';
import { useArticle } from '@/hooks/queries/useArticles';
import { useArticleComments, useCreateComment } from '@/hooks/queries/useComments';
import ArticleCard from '@/components/features/feed/article-card';
import CommentCard from '@/components/features/feed/comment-card';
import { ArrowLeft, Loader2, User } from 'lucide-react';
import { useAuthStore } from '@/stores/useAuthStore';
import { getMediaUrl } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { VerificationBadge } from '@/components/ui/verification-badge';

export default function ArticlePage() {
    const { id } = useParams();
    const router = useRouter();
    const articleId = Number(id);
    const { user } = useAuthStore();

    const { data: article, isLoading: articleLoading, error: articleError } = useArticle(articleId);
    const { data: comments, isLoading: commentsLoading } = useArticleComments(articleId);
    const { mutateAsync: createComment, isPending: isCommenting } = useCreateComment();

    const [content, setContent] = useState('');

    const handleComment = async () => {
        if (!content.trim() || isCommenting) return;
        try {
            await createComment({ content, articleId });
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
                            {(article as any)?.author?.name || 'Article'}
                        </h2>
                        {(article as any)?.author?.isVerified && <VerificationBadge size={18} />}
                    </div>
                    <span className="text-sm text-secondary-foreground opacity-60">
                        Reading Article
                    </span>
                </div>
            </div>

            <div className="flex flex-col min-h-[calc(100vh-3.5rem)]">
                {articleLoading ? (
                    <div className="flex justify-center p-12">
                        <Loader2 className="h-8 w-8 animate-spin text-primary-ui" />
                    </div>
                ) : articleError || !article ? (
                    <div className="flex flex-col items-center justify-center p-12 text-center">
                        <h3 className="text-xl font-bold">Article not found</h3>
                        <p className="text-secondary-foreground opacity-60 mt-2">
                            It looks like this article was deleted or does not exist.
                        </p>
                    </div>
                ) : (
                    <>
                        {/* The main article */}
                        <div className="flex flex-col bg-background">
                            {article.banner && (
                                <div className="w-full aspect-video md:aspect-21/9 overflow-hidden border-b border-border-ui">
                                    <img
                                        src={getMediaUrl(article.banner)}
                                        alt={article.title}
                                        className="w-full h-full object-cover select-none"
                                        draggable={false}
                                    />
                                </div>
                            )}

                            <div className="p-6 md:p-8 flex flex-col gap-6 max-w-3xl mx-auto w-full">
                                {/* Author Info */}
                                <div className="flex items-center gap-3">
                                    <div className="h-12 w-12 rounded-full overflow-hidden bg-secondary-ui border border-border-ui">
                                        {/* @ts-ignore - The Article type definition doesn't have deep author typings mapped yet in frontend type */}
                                        {article.author?.avatar ? (
                                            <img
                                                src={getMediaUrl((article as any).author.avatar)}
                                                alt="Author"
                                                className="h-full w-full object-cover select-none"
                                                draggable={false}
                                            />
                                        ) : (
                                            <User className="h-6 w-6 opacity-40 m-auto mt-3" />
                                        )}
                                    </div>
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-1">
                                            <span className="font-bold">
                                                {(article as any).author?.name || 'Unknown Author'}
                                            </span>
                                            {(article as any).author?.isVerified && (
                                                <VerificationBadge size={16} />
                                            )}
                                        </div>
                                        <span className="text-sm opacity-50">
                                            @{(article as any).author?.username || 'unknown'}
                                        </span>
                                    </div>
                                </div>

                                <h1 className="text-3xl md:text-5xl font-black leading-tight text-foreground select-text">
                                    {article.title}
                                </h1>

                                <div className="h-px w-full bg-border-ui" />

                                <div className="prose prose-neutral dark:prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-secondary-ui prose-pre:border prose-pre:border-border-ui prose-a:text-primary-ui text-[17px] md:text-lg select-text">
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                        {article.body}
                                    </ReactMarkdown>
                                </div>
                            </div>
                        </div>

                        {/* Hidden ArticleCard to keep the like/bookmark logic uniform but out of sight for now */}
                        <div className="hidden border-y border-border-ui p-4 bg-secondary-ui/5">
                            <ArticleCard article={article} />
                        </div>

                        {/* Reply Input Box */}
                        <div
                            id="comments"
                            className="w-full border-t border-b p-4 flex flex-col gap-3 scroll-mt-20"
                        >
                            <h3 className="font-bold text-lg mb-2">
                                Discussion ({article._count?.comments || 0})
                            </h3>
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
                                        placeholder="Share your thoughts..."
                                        className="w-full resize-none border-none bg-transparent text-lg outline-none placeholder:text-foreground/40 mt-1.5 focus:ring-0"
                                        rows={1}
                                        onInput={(e) => {
                                            e.currentTarget.style.height = 'auto';
                                            e.currentTarget.style.height =
                                                Math.min(e.currentTarget.scrollHeight, 200) + 'px';
                                        }}
                                    />
                                    <div className="flex w-full items-center justify-end mt-2 pt-2 border-t border-border-ui">
                                        <button
                                            onClick={handleComment}
                                            disabled={!content.trim() || isCommenting}
                                            className="flex items-center gap-2 rounded-full bg-primary-ui px-5 py-1.5 font-bold text-background transition-transform hover:opacity-90 active:scale-95 disabled:opacity-50 disabled:hover:opacity-50"
                                        >
                                            {isCommenting ? (
                                                <Loader2 className="h-4 w-4 animate-spin outline-none" />
                                            ) : (
                                                'Respond'
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
                                No discussion yet. Be the first to share your thoughts!
                            </div>
                        )}
                    </>
                )}
            </div>
        </MainLayout>
    );
}

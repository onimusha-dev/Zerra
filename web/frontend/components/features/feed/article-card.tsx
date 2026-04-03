'use client';

import React from 'react';
import { Article } from '@/types/feed';
import { MessageCircle, Repeat2, Share2, MoreHorizontal, Trash2, Edit2 } from 'lucide-react';
import { formatRelativeTime } from '@/lib/time';
import { motion, AnimatePresence } from 'framer-motion';
import { cn, getMediaUrl } from '@/lib/utils';
import Link from 'next/link';
import LikeButton from './like-button';
import BookmarkButton from './bookmark-button';
import { useAuthStore } from '@/stores/useAuthStore';
import { useDeleteArticle } from '@/hooks/queries/useArticles';
import { VerificationBadge } from '@/components/ui/verification-badge';
import { useRouter } from 'next/navigation';

interface ArticleCardProps {
    article: Article;
    className?: string;
}

export default function ArticleCard({ article, className }: ArticleCardProps) {
    const router = useRouter();
    const {
        author: articleAuthor,
        user: articleUser,
        title,
        body,
        banner,
        createdAt,
        _count,
        id,
    } = article as any;

    const author = articleAuthor || articleUser;
    // Also check for logo property if avatar is missing
    const avatarUrl = author?.avatar || author?.logo || (article as any).logo;

    const { user } = useAuthStore();
    const isAuthor = user && user.id === author?.id;
    const [showMenu, setShowMenu] = React.useState(false);
    const { mutate: deleteArticle, isPending: isDeleting } = useDeleteArticle();

    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this article?')) {
            deleteArticle(id);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => router.push(`/articles/${article?.id || id}`)}
            className={cn(
                'group flex w-full gap-3 border-b p-4 transition-colors hover:bg-secondary-ui/10 cursor-pointer',
                className,
            )}
        >
            <div onClick={(e) => e.stopPropagation()} className="shrink-0">
                <Link href={author ? `/profile/${author.username}` : '#'}>
                    <div className="h-10 w-10 overflow-hidden rounded-full bg-accent-ui border border-border-ui">
                        {avatarUrl ? (
                            <img
                                src={getMediaUrl(avatarUrl)}
                                alt={author?.name || 'Logo'}
                                className="h-full w-full object-cover select-none"
                                draggable={false}
                            />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center text-xs font-bold opacity-40">
                                {author?.name?.charAt(0) || '?'}
                            </div>
                        )}
                    </div>
                </Link>
            </div>

            <div className="flex flex-1 flex-col gap-1 min-w-0">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-[15px] min-w-0">
                        <span className="text-secondary-foreground opacity-30">·</span>
                        {author ? (
                            <>
                                <Link
                                    href={`/profile/${author.username}`}
                                    className="font-bold hover:underline flex items-center gap-1 truncate"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <span className="truncate">{author.name}</span>
                                    {author.isVerified && <VerificationBadge size={14} />}
                                </Link>
                                <span className="text-secondary-foreground opacity-50 truncate">
                                    @{author.username}
                                </span>
                            </>
                        ) : (
                            <span className="text-secondary-foreground opacity-50">
                                Unknown User
                            </span>
                        )}
                        <span className="text-secondary-foreground opacity-30">·</span>
                        <span className="text-secondary-foreground opacity-50 hover:underline cursor-pointer">
                            {formatRelativeTime(createdAt)}
                        </span>
                    </div>
                    <div className="flex gap-3 items-center justify-center">
                        <div className="flex h-5 items-center justify-center rounded-full bg-primary-ui/20 px-2 text-[10px] font-bold text-primary-ui">
                            ARTICLE
                        </div>

                        {isAuthor && (
                            <div className="relative" onClick={(e) => e.stopPropagation()}>
                                <button
                                    onClick={() => setShowMenu(!showMenu)}
                                    className="rounded-full p-2 text-secondary-foreground opacity-50 transition-colors hover:bg-primary-ui/10 hover:text-primary-ui"
                                >
                                    <MoreHorizontal className="h-4 w-4" />
                                </button>

                                <AnimatePresence>
                                    {showMenu && (
                                        <>
                                            <div
                                                className="fixed inset-0 z-10"
                                                onClick={() => setShowMenu(false)}
                                            />
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.95 }}
                                                className="absolute right-0 top-full mt-1 z-20 w-40 rounded-xl bg-background border border-border-ui shadow-xl overflow-hidden py-1"
                                            >
                                                <button
                                                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-left hover:bg-secondary-ui/50 transition-colors"
                                                    onClick={() =>
                                                        router.push(`/articles/${id}/edit`)
                                                    }
                                                >
                                                    <Edit2 className="h-4 w-4" />
                                                    Edit Article
                                                </button>
                                                <button
                                                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-left text-red-500 hover:bg-red-500/10 transition-colors"
                                                    onClick={() => {
                                                        setShowMenu(false);
                                                        handleDelete();
                                                    }}
                                                    disabled={isDeleting}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                    {isDeleting ? 'Deleting...' : 'Delete Article'}
                                                </button>
                                            </motion.div>
                                        </>
                                    )}
                                </AnimatePresence>
                            </div>
                        )}
                    </div>
                </div>

                <div className="group/content py-1">
                    <h3 className="text-xl font-bold leading-tight group-hover:text-primary-ui transition-colors line-clamp-2">
                        {title}
                    </h3>
                    <div className="relative mt-2">
                        <p className="text-[15px] leading-relaxed text-secondary-foreground opacity-70 wrap-break-word line-clamp-6">
                            {body}
                        </p>
                        {(body.length > 280 || body.split('\n').length > 6) && (
                            <div className="mt-3 inline-flex items-center text-primary-ui font-semibold text-sm hover:underline hover:translate-x-0.5 transition-transform gap-1">
                                Read full article →
                            </div>
                        )}
                    </div>
                </div>

                {banner && (
                    <div className="mt-3 overflow-hidden rounded-xl border border-border-ui aspect-video">
                        <img
                            src={getMediaUrl(banner)}
                            alt={title}
                            className="h-full w-full object-cover transition-transform duration-500 hover:scale-105 select-none"
                            draggable={false}
                        />
                    </div>
                )}

                <div
                    className="mt-3 flex max-w-md justify-between text-secondary-foreground opacity-60"
                    onClick={(e) => e.stopPropagation()}
                >
                    <Link
                        href={`/articles/${article.id}#comments`}
                        className="group flex items-center gap-2 transition-colors hover:text-primary-ui"
                    >
                        <div className="rounded-full p-2 group-hover:bg-primary-ui/10">
                            <MessageCircle className="h-4.5 w-4.5" />
                        </div>
                        <span className="text-xs">{_count?.comments || 0}</span>
                    </Link>

                    <button className="group flex items-center gap-2 transition-colors hover:text-emerald-500">
                        <div className="rounded-full p-2 group-hover:bg-emerald-500/10">
                            <Repeat2 className="h-4.5 w-4.5" />
                        </div>
                        <span className="text-xs">0</span>
                    </button>

                    <LikeButton
                        itemId={article.id}
                        initialLiked={!!article.liked}
                        initialCount={_count?.likes || 0}
                        type="articles"
                    />

                    <div className="flex items-center">
                        <BookmarkButton
                            itemId={article.id}
                            initialBookmarked={!!article.bookmarked}
                            type="articles"
                        />

                        <button className="group flex items-center transition-colors hover:text-primary-ui ml-1">
                            <div className="rounded-full p-2 group-hover:bg-primary-ui/10">
                                <Share2 className="h-4.5 w-4.5" />
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

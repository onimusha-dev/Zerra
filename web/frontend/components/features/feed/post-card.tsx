'use client';

import React from 'react';
import { Post } from '@/types/feed';
import { MessageCircle, Repeat2, Share2, MoreHorizontal, Trash2, Edit2 } from 'lucide-react';
import { formatRelativeTime } from '@/lib/time';
import { motion, AnimatePresence } from 'framer-motion';
import { cn, getMediaUrl } from '@/lib/utils';
import Link from 'next/link';
import LikeButton from './like-button';
import BookmarkButton from './bookmark-button';
import { useAuthStore } from '@/stores/useAuthStore';
import { useDeletePost, useUpdatePost } from '@/hooks/queries/usePosts';
import { useRouter } from 'next/navigation';
import { VerificationBadge } from '@/components/ui/verification-badge';

interface PostCardProps {
    post: Post;
    className?: string;
    isDetailedView?: boolean;
}

export default function PostCard({ post, className, isDetailedView = false }: PostCardProps) {
    const {
        author: postAuthor,
        user: postUser,
        content,
        media,
        createdAt,
        _count,
        id,
    } = post as any;
    const author = postAuthor || postUser;
    // Also check for logo property if avatar is missing
    const avatarUrl = author?.avatar || author?.logo || (post as any).logo;

    const { user } = useAuthStore();
    const isAuthor = user && user.id === author?.id;
    const [showMenu, setShowMenu] = React.useState(false);
    const { mutate: deletePost, isPending: isDeleting } = useDeletePost();
    const { mutate: updatePost, isPending: isUpdating } = useUpdatePost();

    const [isEditing, setIsEditing] = React.useState(false);
    const [editContent, setEditContent] = React.useState(content);
    const [isPublished, setIsPublished] = React.useState(post.published ?? true);
    const [isExpanded, setIsExpanded] = React.useState(false);
    const [isClipped, setIsClipped] = React.useState(false);
    const contentRef = React.useRef<HTMLDivElement>(null);
    const router = useRouter();

    React.useEffect(() => {
        if (!isDetailedView && contentRef.current) {
            const hasOverflow = contentRef.current.scrollHeight > contentRef.current.offsetHeight;
            setIsClipped(hasOverflow);
        }
    }, [content, isDetailedView]);

    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this post?')) {
            deletePost(id);
        }
    };

    const handleUpdate = () => {
        if (!editContent.trim()) return;
        updatePost(
            { postId: id, content: editContent, published: isPublished },
            {
                onSuccess: () => setIsEditing(false),
                onError: (error: any) => {
                    alert(
                        error.response?.data?.message || error.message || 'Failed to update post',
                    );
                },
            },
        );
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
                'group flex w-full gap-3 border-b p-4 transition-colors hover:bg-secondary-ui/10',
                className,
            )}
        >
            <Link href={author ? `/profile/${author.username}` : '#'} className="shrink-0">
                <div className="h-10 w-10 overflow-hidden rounded-full bg-accent-ui border border-border-ui">
                    {avatarUrl ? (
                        <img
                            src={getMediaUrl(avatarUrl)}
                            alt={author?.name || 'Logo'}
                            className="h-full w-full object-cover select-none"
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs font-bold opacity-40">
                            {author?.name?.charAt(0) || '?'}
                        </div>
                    )}
                </div>
            </Link>

            <div className="flex flex-1 flex-col gap-1 min-w-0">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-[15px] min-w-0">
                        {author ? (
                            <>
                                <Link
                                    href={`/profile/${author.username}`}
                                    className="font-bold hover:underline flex items-center gap-1 truncate"
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

                    {isAuthor && (
                        <div className="relative">
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
                                                onClick={() => {
                                                    setShowMenu(false);
                                                    setIsEditing(true);
                                                    setEditContent(content);
                                                }}
                                            >
                                                <Edit2 className="h-4 w-4" />
                                                Edit Post
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
                                                {isDeleting ? 'Deleting...' : 'Delete Post'}
                                            </button>
                                        </motion.div>
                                    </>
                                )}
                            </AnimatePresence>
                        </div>
                    )}
                </div>

                {isEditing ? (
                    <div className="flex flex-col gap-1">
                        <textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            className="w-full resize-none rounded-xl border border-border-ui bg-background p-3 text-foreground outline-none focus:border-primary-ui focus:ring-1 focus:ring-primary-ui"
                            rows={3}
                            autoFocus
                        />
                        <div className="flex justify-between items-center px-1">
                            <div className="flex items-center gap-4">
                                <span
                                    className={cn(
                                        'text-[10px] font-medium transition-colors',
                                        !user?.isVerified && editContent.length > 500
                                            ? 'text-red-500'
                                            : 'text-secondary-foreground opacity-40',
                                    )}
                                >
                                    {editContent.length}
                                    {!user?.isVerified && ' / 500'}
                                </span>
                                <label className="flex items-center gap-1.5 cursor-pointer group/toggle">
                                    <input
                                        type="checkbox"
                                        checked={isPublished}
                                        onChange={(e) => setIsPublished(e.target.checked)}
                                        className="hidden"
                                    />
                                    <div
                                        className={cn(
                                            'w-7 h-4 rounded-full transition-colors relative',
                                            isPublished
                                                ? 'bg-primary-ui'
                                                : 'bg-secondary-ui border border-border-ui',
                                        )}
                                    >
                                        <div
                                            className={cn(
                                                'absolute top-0.5 left-0.5 w-3 h-3 rounded-full transition-transform',
                                                isPublished
                                                    ? 'translate-x-3 bg-background'
                                                    : 'bg-foreground/40',
                                            )}
                                        />
                                    </div>
                                    <span className="text-[10px] font-bold opacity-60 group-hover/toggle:opacity-100 transition-opacity">
                                        {isPublished ? 'Published' : 'Draft'}
                                    </span>
                                </label>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setIsEditing(false)}
                                    className="rounded-full px-4 py-1.5 text-sm font-bold text-foreground hover:bg-secondary-ui transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleUpdate}
                                    disabled={
                                        isUpdating ||
                                        !editContent.trim() ||
                                        (editContent === content &&
                                            isPublished === (post.published ?? true)) ||
                                        (!user?.isVerified && editContent.length > 500)
                                    }
                                    className="rounded-full bg-primary-ui px-4 py-1.5 text-sm font-bold text-background hover:opacity-90 disabled:opacity-50 transition-all"
                                >
                                    {isUpdating ? 'Saving...' : 'Save'}
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div
                        onClick={() => {
                            if (!isDetailedView) router.push(`/post/${id}`);
                        }}
                        className={cn('group/content', !isDetailedView && 'cursor-pointer')}
                    >
                        <div
                            ref={!isDetailedView ? contentRef : undefined}
                            className={cn(
                                'text-[15px] leading-normal whitespace-pre-wrap wrap-break-word transition-all',
                                !isDetailedView && !isExpanded && 'line-clamp-4',
                                isDetailedView && 'text-[16px]',
                            )}
                        >
                            {content}
                        </div>

                        {!isDetailedView && (isClipped || isExpanded) && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsExpanded(!isExpanded);
                                }}
                                className="mt-1 text-primary-ui hover:underline font-medium text-sm"
                            >
                                {isExpanded ? 'Show less' : 'Show more'}
                            </button>
                        )}

                        {media && (
                            <div className="mt-3 overflow-hidden rounded-2xl border border-border-ui">
                                <img
                                    src={getMediaUrl(media)}
                                    alt="Post content"
                                    className="max-h-[500px] w-full object-cover"
                                />
                            </div>
                        )}
                    </div>
                )}

                <div className="mt-3 flex max-w-md justify-between text-secondary-foreground opacity-60">
                    <Link
                        href={`/post/${id}#comments`}
                        className="group flex items-center gap-2 transition-colors hover:text-primary-ui"
                    >
                        <div className="rounded-full p-2 group-hover:bg-primary-ui/10">
                            <MessageCircle className="h-[18px] w-[18px]" />
                        </div>
                        <span className="text-xs">{_count?.comments || 0}</span>
                    </Link>

                    <button className="group flex items-center gap-2 transition-colors hover:text-emerald-500">
                        <div className="rounded-full p-2 group-hover:bg-emerald-500/10">
                            <Repeat2 className="h-[18px] w-[18px]" />
                        </div>
                        <span className="text-xs">0</span>
                    </button>

                    <LikeButton
                        itemId={post.id}
                        initialLiked={!!post.liked}
                        initialCount={_count?.likes || 0}
                        type="posts"
                    />

                    <div className="flex items-center">
                        <BookmarkButton
                            itemId={post.id}
                            initialBookmarked={!!post.bookmarked}
                            type="posts"
                        />

                        <button className="group flex items-center transition-colors hover:text-primary-ui ml-1">
                            <div className="rounded-full p-2 group-hover:bg-primary-ui/10">
                                <Share2 className="h-[18px] w-[18px]" />
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

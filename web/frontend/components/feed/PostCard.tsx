'use client';

import React from 'react';
import Link from 'next/link';
import { MessageCircle, Heart, Bookmark, Share, BarChart2 } from 'lucide-react';
import { Post } from '@/types';
import { ActionButton } from './ActionButton';
import { useInteractions } from '@/hooks/useInteractions';
import { FeedItemShell } from './FeedItemShell';

const PREVIEW_LENGTH = 300;

export function PostCard({ post: initialPost }: { post: Post }) {
    const [post, setPost] = React.useState(initialPost);
    const [expanded, setExpanded] = React.useState(false);
    const { liked, bookmarked, toggleLike, toggleBookmark } = useInteractions(
        post.id,
        'post',
        post.liked,
        post.bookmarked,
    );

    const isLong = post.content.length > PREVIEW_LENGTH;
    const displayContent =
        isLong && !expanded ? post.content.slice(0, PREVIEW_LENGTH).trimEnd() + '…' : post.content;

    const handleLike = (e: React.MouseEvent) => {
        toggleLike(e, (newLiked) => {
            setPost((prev) => ({
                ...prev,
                liked: newLiked,
                _count: { ...prev._count, likes: (prev._count?.likes || 0) + (newLiked ? 1 : -1) },
            }));
        });
    };

    const handleBookmark = (e: React.MouseEvent) => {
        toggleBookmark(e, (newBookmarked) => {
            setPost((prev) => ({
                ...prev,
                bookmarked: newBookmarked,
                _count: {
                    ...prev._count,
                    bookmarks: (prev._count?.bookmarks || 0) + (newBookmarked ? 1 : -1),
                },
            }));
        });
    };

    if (!post.author) return null;

    return (
        <FeedItemShell
            author={post.author}
            createdAt={post.createdAt}
            footer={
                <>
                    <ActionButton
                        icon={MessageCircle}
                        count={post._count?.comments || 0}
                        color="primary"
                        href={`/posts/${post.id}`}
                    />
                    <ActionButton
                        icon={Heart}
                        count={post._count?.likes || 0}
                        color="rose-500"
                        active={liked}
                        onClick={handleLike}
                    />
                    <ActionButton icon={BarChart2} count={0} color="sky-500" />
                    <ActionButton
                        icon={Bookmark}
                        color="sky-500"
                        active={bookmarked}
                        onClick={handleBookmark}
                    />
                    <ActionButton icon={Share} color="primary" />
                </>
            }
        >
            <div className="space-y-3" draggable={false}>
                <Link href={`/posts/${post.id}`} className="block">
                    <p className="text-[15px] leading-[1.7] text-foreground/95 whitespace-pre-wrap">
                        {displayContent}
                    </p>
                </Link>

                {isLong && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setExpanded(!expanded);
                        }}
                        className="text-[11px] font-black uppercase tracking-[0.15em] text-primary hover:opacity-70 transition-opacity"
                    >
                        {expanded ? '↑ Show less' : '↓ Read more'}
                    </button>
                )}

                {(post.media || post.banner) && (
                    <Link href={`/posts/${post.id}`} className="block mt-1">
                        <div className="rounded-2xl overflow-hidden border border-border/15 hover:border-primary/25 transition-colors">
                            <img
                                src={post.media || post.banner}
                                alt="media"
                                className="w-full max-h-[420px] object-cover hover:scale-[1.01] transition-transform duration-700"
                            />
                        </div>
                    </Link>
                )}
            </div>
        </FeedItemShell>
    );
}

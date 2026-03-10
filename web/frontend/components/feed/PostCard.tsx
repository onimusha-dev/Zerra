'use client';

import React from 'react';
import { MessageCircle, Heart, Bookmark, Share, BarChart2 } from 'lucide-react';
import Link from 'next/link';
import { Post } from './types';
import { ActionButton } from './ActionButton';
import { useInteractions } from '@/hooks/useInteractions';
import { FeedItemShell } from './FeedItemShell';

export function PostCard({ post: initialPost }: { post: Post }) {
    const [post, setPost] = React.useState(initialPost);
    const { liked, bookmarked, toggleLike, toggleBookmark } = useInteractions(
        post.id,
        'post',
        post.liked,
        post.bookmarked,
    );

    const handleLike = (e: React.MouseEvent) => {
        toggleLike(e, (newLiked) => {
            setPost((prev) => ({
                ...prev,
                liked: newLiked,
                _count: {
                    ...prev._count,
                    likes: (prev._count?.likes || 0) + (newLiked ? 1 : -1),
                },
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
                        size={18}
                        color="primary"
                        href={`/posts/${post.id}`}
                    />
                    <ActionButton
                        icon={Heart}
                        count={post._count?.likes || 0}
                        size={18}
                        color="rose-500"
                        active={liked}
                        onClick={handleLike}
                    />
                    <ActionButton icon={BarChart2} count={0} size={18} color="sky-500" />
                    <ActionButton
                        icon={Bookmark}
                        size={18}
                        color="sky-500"
                        active={bookmarked}
                        onClick={handleBookmark}
                    />
                    <ActionButton icon={Share} size={18} color="primary" />
                </>
            }
        >
            <Link href={`/posts/${post.id}`} className="block">
                <p className="text-base sm:text-lg leading-relaxed text-foreground/90 whitespace-pre-wrap font-medium">
                    {post.content}
                </p>

                {(post.media || post.banner) && (
                    <div className="border border-border/10 rounded-2xl overflow-hidden mt-4 group/media hover:border-primary/20 transition-all bg-card/20">
                        <img
                            src={post.media || post.banner}
                            alt="transmission media"
                            className="w-full h-auto max-h-[512px] object-cover group-hover:scale-[1.01] transition-transform duration-500"
                        />
                    </div>
                )}
            </Link>
        </FeedItemShell>
    );
}

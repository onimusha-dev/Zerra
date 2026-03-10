'use client';

import React from 'react';
import Link from 'next/link';
import { MessageCircle, Heart, Bookmark, Share, BarChart2 } from 'lucide-react';
import { Article } from '@/types';
import { ActionButton } from './ActionButton';
import { useInteractions } from '@/hooks/useInteractions';
import { FeedItemShell } from './FeedItemShell';

export function ArticleCard({ article: initialArticle }: { article: Article }) {
    const author = initialArticle.author || initialArticle.user;
    const [article, setArticle] = React.useState(initialArticle);
    const { liked, bookmarked, toggleLike, toggleBookmark } = useInteractions(
        article.id,
        'article',
        article.liked,
        article.bookmarked,
    );

    const handleLike = (e: React.MouseEvent) => {
        toggleLike(e, (newLiked) => {
            setArticle((prev) => ({
                ...prev,
                liked: newLiked,
                _count: { ...prev._count, likes: (prev._count?.likes || 0) + (newLiked ? 1 : -1) },
            }));
        });
    };

    const handleBookmark = (e: React.MouseEvent) => {
        toggleBookmark(e, (newBookmarked) => {
            setArticle((prev) => ({
                ...prev,
                bookmarked: newBookmarked,
                _count: {
                    ...prev._count,
                    bookmarks: (prev._count?.bookmarks || 0) + (newBookmarked ? 1 : -1),
                },
            }));
        });
    };

    if (!author) return null;

    return (
        <FeedItemShell
            author={author}
            createdAt={article.createdAt}
            footer={
                <>
                    <ActionButton
                        icon={MessageCircle}
                        count={article._count?.comments || 0}
                        color="primary"
                        href={`/articles/${article.id}#comments`}
                    />
                    <ActionButton
                        icon={Heart}
                        count={article._count?.likes || 0}
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
            <Link href={`/articles/${article.id}`} className="block" draggable={false}>
                <div className="rounded-2xl overflow-hidden border border-primary/30 transition-all duration-200 bg-card/50">
                    {/* Banner */}
                    {article.banner && (
                        <div className="overflow-hidden">
                            <img
                                src={article.banner}
                                alt={article.title}
                                className="w-full max-h-60 object-cover hover:scale-[1.02] transition-transform duration-700"
                            />
                        </div>
                    )}

                    {/* Text content */}
                    <div className={`p-4 ${article.banner ? 'border-t border-border/8' : ''}`}>
                        <h3 className="text-[15px] font-black tracking-tight leading-snug text-foreground mb-1.5 capitalize">
                            {article.title}
                        </h3>
                        <p className="text-[13px] text-foreground/60 line-clamp-2 leading-relaxed">
                            {article.body}
                        </p>
                    </div>
                </div>
            </Link>
        </FeedItemShell>
    );
}

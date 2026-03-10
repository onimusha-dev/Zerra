'use client';

import React from 'react';
import { MessageCircle, Heart, Bookmark, Share, BarChart2 } from 'lucide-react';
import Link from 'next/link';
import { Article } from './types';
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
                _count: {
                    ...prev._count,
                    likes: (prev._count?.likes || 0) + (newLiked ? 1 : -1),
                },
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
                        size={18}
                        color="primary"
                        href={`/articles/${article.id}#comments`}
                    />
                    <ActionButton
                        icon={Heart}
                        count={article._count?.likes || 0}
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
            <Link href={`/articles/${article.id}`} className="block group/content">
                <div className="border border-border/10 rounded-2xl overflow-hidden hover:border-primary/20 transition-all bg-card/40 backdrop-blur-sm">
                    {article.banner && (
                        <div className="overflow-hidden border-b border-border/10">
                            <img
                                src={article.banner}
                                alt={article.title}
                                className="w-full max-h-96 object-cover group-hover/content:scale-[1.02] transition-transform duration-700"
                            />
                        </div>
                    )}
                    <div className="p-5 space-y-3">
                        <h3 className="text-2xl font-black leading-tight tracking-tighter uppercase italic text-foreground/90 group-hover/content:text-primary transition-colors">
                            {article.title}
                        </h3>
                        <p className="text-base text-muted-foreground/80 line-clamp-3 leading-relaxed font-medium">
                            {article.body}
                        </p>
                    </div>
                </div>
            </Link>
        </FeedItemShell>
    );
}

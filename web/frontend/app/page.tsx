'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useFeed } from '@/hooks/useFeed';
import { useCreatePost } from '@/hooks/useCreatePost';
import { useUser } from '@/hooks/useUser';
import { PostComposer } from '@/components/composer/PostComposer';
import { FeedStream } from '@/components/feed/FeedStream';
import { FeedFilters } from '@/components/feed/FeedFilters';
import { FeedItem } from '@/types';

export default function HomeFeed() {
    const { user } = useUser();
    const { items, isLoading, error, prependItem } = useFeed();
    const { content, setContent, banner, setBanner, isPosting, handleCreatePost } = useCreatePost(
        (newItem: FeedItem) => prependItem(newItem),
    );

    const [isHeaderVisible, setIsHeaderVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            if (currentScrollY < lastScrollY || currentScrollY < 50) {
                setIsHeaderVisible(true);
            } else if (currentScrollY > 100 && currentScrollY > lastScrollY) {
                setIsHeaderVisible(false);
            }
            setLastScrollY(currentScrollY);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [lastScrollY]);

    return (
        <div className="flex flex-col min-h-screen w-full">
            {/* Smart Sticky Composer + Filters */}
            <div
                className={cn(
                    'sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/10 transition-transform duration-500 ease-in-out',
                    isHeaderVisible ? 'translate-y-0' : '-translate-y-full',
                )}
            >
                <PostComposer
                    user={user}
                    content={content}
                    setContent={setContent}
                    banner={banner}
                    setBanner={setBanner}
                    isPosting={isPosting}
                    handleCreatePost={handleCreatePost}
                />
                <div className="px-4">
                    <FeedFilters />
                </div>
            </div>

            <div className="w-full mt-4 pb-24">
                <FeedStream items={items} isLoading={isLoading} error={error} />
            </div>
        </div>
    );
}

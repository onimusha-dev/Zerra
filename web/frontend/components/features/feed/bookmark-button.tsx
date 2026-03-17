'use client';

import React, { useState, useEffect } from 'react';
import { Bookmark } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useInteract } from '@/hooks/mutations/useInteract';
import { useAuthStore } from '@/stores/useAuthStore';
import { useRouter } from 'next/navigation';

interface BookmarkButtonProps {
    itemId: number;
    initialBookmarked: boolean;
    type: 'posts' | 'articles';
    className?: string;
}

export default function BookmarkButton({
    itemId,
    initialBookmarked,
    type,
    className,
}: BookmarkButtonProps) {
    const { isAuthenticated } = useAuthStore();
    const router = useRouter();
    const { toggleBookmark } = useInteract(type);

    const [isBookmarked, setIsBookmarked] = useState(initialBookmarked);

    // Sync with props if they change
    useEffect(() => {
        setIsBookmarked(initialBookmarked);
    }, [initialBookmarked]);

    const handleBookmark = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!isAuthenticated) {
            router.push('/auth/login');
            return;
        }

        const newBookmarked = !isBookmarked;

        // Optimistic Update
        setIsBookmarked(newBookmarked);

        toggleBookmark.mutate(itemId, {
            onError: (error) => {
                console.error('Bookmark mutation failed:', error);
                // Revert on error
                setIsBookmarked(!newBookmarked);
            },
        });
    };

    return (
        <button
            onClick={handleBookmark}
            disabled={toggleBookmark.isPending}
            className={cn(
                'group flex items-center gap-2 transition-colors hover:text-primary-ui disabled:opacity-70',
                isBookmarked && 'text-primary-ui',
                className,
            )}
        >
            <div className="rounded-full p-2 group-hover:bg-primary-ui/10 transition-colors">
                <Bookmark
                    className={cn(
                        'h-[18px] w-[18px] transition-all',
                        isBookmarked && 'fill-current',
                    )}
                />
            </div>
        </button>
    );
}

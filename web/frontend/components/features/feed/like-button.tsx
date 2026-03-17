'use client';

import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useInteract } from '@/hooks/mutations/useInteract';
import { useAuthStore } from '@/stores/useAuthStore';
import { useRouter } from 'next/navigation';

interface LikeButtonProps {
    itemId: number;
    initialLiked: boolean;
    initialCount: number;
    type: 'posts' | 'articles' | 'comments';
    className?: string;
}

export default function LikeButton({
    itemId,
    initialLiked,
    initialCount,
    type,
    className,
}: LikeButtonProps) {
    const { isAuthenticated } = useAuthStore();
    const router = useRouter();
    const { toggleLike } = useInteract(type);

    const [isLiked, setIsLiked] = useState(initialLiked);
    const [count, setCount] = useState(initialCount);

    // Sync with props if they change (e.g. after a refetch)
    useEffect(() => {
        setIsLiked(initialLiked);
        setCount(initialCount);
    }, [initialLiked, initialCount]);

    const handleLike = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!isAuthenticated) {
            router.push('/auth/login');
            return;
        }

        const newLiked = !isLiked;
        const newCount = newLiked ? count + 1 : Math.max(0, count - 1);

        // Optimistic Update
        setIsLiked(newLiked);
        setCount(newCount);

        toggleLike.mutate(itemId, {
            onError: (error) => {
                console.error('Like mutation failed:', error);
                // Revert on error
                setIsLiked(!newLiked);
                setCount(isLiked ? count : Math.max(0, count - 1));
            },
        });
    };

    return (
        <button
            onClick={handleLike}
            disabled={toggleLike.isPending}
            className={cn(
                'group flex items-center gap-2 transition-colors hover:text-rose-500 disabled:opacity-70',
                isLiked && 'text-rose-500',
                className,
            )}
        >
            <div className="rounded-full p-2 group-hover:bg-rose-500/10 transition-colors">
                <Heart
                    className={cn('h-[18px] w-[18px] transition-all', isLiked && 'fill-current')}
                />
            </div>
            <span className="text-xs font-medium">{count}</span>
        </button>
    );
}

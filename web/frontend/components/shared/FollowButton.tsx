'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { fetchApi } from '@/lib/api';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface FollowButtonProps {
    userId: string;
    initialIsFollowing?: boolean;
    className?: string;
}

export function FollowButton({ userId, initialIsFollowing = false, className }: FollowButtonProps) {
    const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
    const [isLoading, setIsLoading] = useState(false);

    const handleFollow = async () => {
        setIsLoading(true);
        try {
            const endpoint = `/api/users/${userId}/${isFollowing ? 'unfollow' : 'follow'}`;
            const res = await fetchApi(endpoint, { method: 'POST' });
            if (res.ok) {
                setIsFollowing(!isFollowing);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Button
            onClick={handleFollow}
            disabled={isLoading}
            className={cn(
                'rounded-full font-bold uppercase tracking-widest text-[10px] px-8 h-9 transition-all active:scale-95',
                isFollowing
                    ? 'bg-transparent border border-border/20 text-foreground hover:border-rose-500/50 hover:text-rose-500 hover:bg-rose-500/5'
                    : 'bg-primary text-primary-foreground hover:bg-primary/90',
                className,
            )}
        >
            {isLoading ? (
                <Loader2 className="h-3 w-3 animate-spin" />
            ) : isFollowing ? (
                'Sync Active'
            ) : (
                'Synchronize'
            )}
        </Button>
    );
}

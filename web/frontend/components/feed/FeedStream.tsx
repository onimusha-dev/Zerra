import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LoadingState } from '@/components/shared/LoadingState';
import { EmptyState } from '@/components/shared/EmptyState';
import { PostCard } from './PostCard';
import { ArticleCard } from './ArticleCard';
import { FeedItem } from '@/types';

interface FeedStreamProps {
    items: FeedItem[];
    isLoading: boolean;
    error: string | null;
}

export function FeedStream({ items, isLoading, error }: FeedStreamProps) {
    if (isLoading) {
        return <LoadingState message="Decrypting Frequencies" />;
    }

    return (
        <div className="divide-y divide-border/5">
            {error && (
                <Alert
                    variant="destructive"
                    className="mb-6 rounded-2xl border-destructive/20 bg-destructive/5 text-destructive font-bold text-[9px] uppercase tracking-widest"
                >
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {items.length === 0 ? (
                <EmptyState
                    title="Stagnant Frequency Hub"
                    description="Awaiting External Signal Injection"
                />
            ) : (
                items.map((item, idx) => (
                    <div
                        key={idx}
                        className="animate-in fade-in slide-in-from-bottom-2 duration-500"
                        style={{ animationDelay: `${idx * 30}ms` }}
                    >
                        {item.type === 'post' ? (
                            <PostCard key={idx} post={item as any} />
                        ) : (
                            <ArticleCard key={item.id} article={item as any} />
                        )}
                    </div>
                ))
            )}
        </div>
    );
}

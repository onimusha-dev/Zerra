import React from 'react';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PostCard, ArticleCard, FeedItemType } from '@/components/FeedItem';

interface FeedStreamProps {
    items: FeedItemType[];
    isLoading: boolean;
    error: string | null;
}

export function FeedStream({ items, isLoading, error }: FeedStreamProps) {
    return (
        <div className="space-y-6">
            {error && (
                <Alert
                    variant="destructive"
                    className="mb-8 rounded-none border-destructive/20 bg-destructive/5 text-destructive font-bold text-[9px] uppercase tracking-widest"
                >
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center p-24 gap-4 opacity-20">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    <span className="text-[9px] font-bold uppercase tracking-[0.4em] italic leading-none">
                        Decrypting Frequencies
                    </span>
                </div>
            ) : items.length === 0 ? (
                <div className="p-24 text-center border border-dashed border-border/10 rounded-none bg-secondary/5">
                    <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground/20 italic mb-2">
                        Stagnant Frequency Hub
                    </p>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/10">
                        Awaiting External Signal Injection.
                    </p>
                </div>
            ) : (
                items.map((item, key) => (
                    <div
                        key={key}
                        className="animate-in fade-in slide-in-from-bottom-2 duration-500"
                    >
                        {item.type === 'post' ? (
                            <PostCard post={item as any} />
                        ) : (
                            <ArticleCard article={item as any} />
                        )}
                    </div>
                ))
            )}
        </div>
    );
}

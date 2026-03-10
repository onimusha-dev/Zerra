'use client';

import React from 'react';
import { Loader2, MessageCircle, Heart, Repeat2, Bookmark } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { CommentList } from '@/components/Comments';
import { usePost } from '@/hooks/usePost';
import { PostViewHeader } from '@/components/post/PostViewHeader';
import { PostDetailContent } from '@/components/post/PostDetailContent';
import { PostStatButton } from '@/components/post/PostStatButton';

export default function PostViewPage() {
    const router = useRouter();
    const params = useParams();
    const id = params?.id as string;

    const { post, isLoading, error } = usePost(id);

    if (isLoading)
        return (
            <div className="flex flex-col items-center justify-center p-20 gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-foreground opacity-20" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/40 italic">
                    Syncing Transmission
                </span>
            </div>
        );

    if (error || !post)
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] p-10 text-center">
                <h2 className="text-2xl font-black tracking-tighter text-rose-500 mb-2 uppercase italic">
                    {error || 'Intel Missing'}
                </h2>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mb-8">
                    Signal lost in the Zerra void.
                </p>
                <Button
                    variant="outline"
                    onClick={() => router.push('/')}
                    className="rounded-sm font-black text-[10px] uppercase tracking-widest px-10 h-10"
                >
                    Back to Feed
                </Button>
            </div>
        );

    return (
        <div className="flex flex-col min-h-screen">
            <PostViewHeader />

            <div className="px-4 max-w-4xl mx-auto w-full mb-16 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <PostDetailContent post={post} />

                <div className="flex items-center justify-around py-8 border-y border-border/10 mb-12">
                    <PostStatButton icon={Heart} count={128} color="rose-500" />
                    <PostStatButton icon={MessageCircle} count={24} color="primary" />
                    <PostStatButton icon={Repeat2} count={12} color="primary" />
                    <PostStatButton icon={Bookmark} color="primary" />
                </div>

                <div className="space-y-8">
                    <div className="flex items-center gap-4 mb-4">
                        <h3 className="text-[9px] font-bold uppercase tracking-[0.4em] text-muted-foreground/40 italic">
                            Signal Echoes
                        </h3>
                        <div className="flex-1 h-px bg-border/20" />
                    </div>
                    <CommentList postId={id} />
                </div>
            </div>
        </div>
    );
}

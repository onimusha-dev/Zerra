'use client';

import React from 'react';
import { MessageCircle, Heart, Repeat2, Bookmark, Share } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { CommentList } from '@/components/Comments';
import { usePost } from '@/hooks/usePost';
import { LoadingState } from '@/components/shared/LoadingState';
import { PageHeader } from '@/components/shared/PageHeader';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDate } from '@/lib/utils';

function StatBar({ likes, comments, icon }: { likes: number; comments: number; icon?: any }) {
    return null;
}

export default function PostViewPage() {
    const router = useRouter();
    const params = useParams();
    const id = params?.id as string;
    const { post, isLoading, error } = usePost(id);

    if (isLoading) return <LoadingState message="Loading post" />;

    if (error || !post)
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] p-10 text-center gap-5">
                <h2 className="text-xl font-black tracking-tight text-rose-500 uppercase">
                    {error || 'Post not found'}
                </h2>
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground/40">
                    This signal was lost in the void.
                </p>
                <Button
                    variant="outline"
                    onClick={() => router.push('/')}
                    className="rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] px-8 h-9"
                >
                    Back to Feed
                </Button>
            </div>
        );

    const author = post.author;

    return (
        <div className="flex flex-col min-h-screen">
            <PageHeader title="Post" />

            <div className="px-4 pt-6 pb-24 animate-in fade-in duration-400">
                {/* Author row */}
                {author && (
                    <div className="flex items-center gap-3 mb-6">
                        <Link href={`/profile?username=${author.username}`}>
                            <Avatar className="h-12 w-12 rounded-2xl border border-border/10 hover:border-primary/30 transition-all">
                                <AvatarImage src={author.avatar} className="object-cover" />
                                <AvatarFallback className="font-black uppercase bg-primary/10 text-primary text-sm">
                                    {author.name?.[0] || 'U'}
                                </AvatarFallback>
                            </Avatar>
                        </Link>
                        <div className="flex-1 min-w-0">
                            <Link
                                href={`/profile?username=${author.username}`}
                                className="text-sm font-black uppercase tracking-tight hover:text-primary transition-colors"
                            >
                                {author.name}
                            </Link>
                            <p className="text-[10px] font-bold text-muted-foreground/35 uppercase tracking-[0.2em] mt-0.5">
                                @{author.username}
                            </p>
                        </div>
                    </div>
                )}

                {/* Post content */}
                <p className="text-lg leading-[1.75] text-foreground/85 whitespace-pre-wrap font-medium mb-5">
                    {post.content}
                </p>

                {/* Media */}
                {(post.media || post.banner) && (
                    <div className="rounded-2xl overflow-hidden border border-border/10 mb-5">
                        <img
                            src={post.media || post.banner}
                            alt="media"
                            className="w-full object-cover max-h-[500px]"
                        />
                    </div>
                )}

                {/* Timestamp */}
                <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-muted-foreground/30 mb-6">
                    {formatDate(post.createdAt)}
                </p>

                {/* Stat bar */}
                <div className="flex items-center gap-6 py-4 border-y border-border/8 mb-8">
                    <button className="flex items-center gap-2 text-muted-foreground/30 hover:text-rose-500 transition-colors">
                        <Heart className="h-5 w-5" />
                        <span className="text-[10px] font-black uppercase tracking-[0.15em]">
                            {post._count?.likes || 0}
                        </span>
                    </button>
                    <button className="flex items-center gap-2 text-muted-foreground/30 hover:text-primary transition-colors">
                        <MessageCircle className="h-5 w-5" />
                        <span className="text-[10px] font-black uppercase tracking-[0.15em]">
                            {post._count?.comments || 0}
                        </span>
                    </button>
                    <button className="flex items-center gap-2 text-muted-foreground/30 hover:text-sky-500 transition-colors">
                        <Repeat2 className="h-5 w-5" />
                    </button>
                    <div className="ml-auto flex gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-2xl h-8 w-8 text-muted-foreground/30 hover:text-primary"
                        >
                            <Bookmark className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-2xl h-8 w-8 text-muted-foreground/30 hover:text-primary"
                        >
                            <Share className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Comments */}
                <div className="space-y-5">
                    <div className="flex items-center gap-3">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40">
                            Responses
                        </h3>
                        <div className="flex-1 h-px bg-border/10" />
                    </div>
                    <CommentList postId={id} />
                </div>
            </div>
        </div>
    );
}

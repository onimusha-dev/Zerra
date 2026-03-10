import React from 'react';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Post } from '@/hooks/usePost';
import { FollowButton } from '../shared/FollowButton';

interface PostContentProps {
    post: Post;
}

export function PostDetailContent({ post }: PostContentProps) {
    if (!post.author) return null;

    return (
        <div className="mb-12">
            <div className="flex items-center gap-5 mb-12 pb-10 border-b border-border/10">
                <Link href={`/profile?username=${post.author.username}`}>
                    <Avatar className="h-14 w-14 rounded-full border border-border/10 ring-4 ring-transparent hover:ring-primary/10 transition-all">
                        <AvatarImage src={post.author.avatar} className="object-cover" />
                        <AvatarFallback className="bg-muted text-foreground font-bold text-xl uppercase italic">
                            {post.author.name?.[0] || 'U'}
                        </AvatarFallback>
                    </Avatar>
                </Link>
                <div className="flex flex-col flex-1 min-w-0">
                    <Link
                        href={`/profile?username=${post.author.username}`}
                        className="font-black text-2xl tracking-tighter hover:text-primary transition-colors uppercase italic leading-none truncate"
                    >
                        {post.author.name}
                    </Link>
                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40 mt-2">
                        <span className="truncate">@{post.author.username}</span>
                        <span className="opacity-20">/</span>
                        <span className="text-primary/60 font-black italic">Verified Node</span>
                    </div>
                </div>
                <FollowButton userId={post.author.username} className="shrink-0" />
            </div>

            <div className="space-y-12 mb-16">
                <p className="text-2xl sm:text-4xl font-medium tracking-tight leading-loose text-foreground whitespace-pre-wrap italic border-l-4 border-primary/20 pl-8 py-4">
                    {post.content}
                </p>

                {(post.media || post.banner) && (
                    <div className="rounded-none overflow-hidden border border-border bg-muted/10">
                        <img
                            src={post.media || post.banner}
                            alt="content"
                            className="w-full h-auto object-cover max-h-[800px]"
                        />
                    </div>
                )}

                <div className="flex items-center gap-4 text-muted-foreground/40 font-bold uppercase tracking-[0.2em] text-[8px] italic">
                    <span>
                        {new Date(post.createdAt).toLocaleTimeString(undefined, {
                            hour: '2-digit',
                            minute: '2-digit',
                        })}
                    </span>
                    <span className="opacity-40">/</span>
                    <span>
                        {new Date(post.createdAt).toLocaleDateString(undefined, {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric',
                        })}
                    </span>
                    <span className="opacity-40">/</span>
                    <span className="text-foreground/40 uppercase">Zerra Frequency</span>
                </div>
            </div>
        </div>
    );
}

'use client';

import React, { useEffect, useState } from 'react';
import {
    ArrowLeft,
    Loader2,
    Calendar,
    Heart,
    Share,
    Bookmark,
    Clock,
    MessageSquare,
} from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';

import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { fetchApi } from '@/lib/api';
import { CommentList } from '@/components/Comments';
import { FollowButton } from '@/components/shared/FollowButton';

interface Article {
    id: string;
    title: string;
    body: string;
    banner?: string;
    createdAt: string;
    author: {
        name: string;
        username: string;
        avatar?: string;
    };
}

export default function ArticleViewPage() {
    const router = useRouter();
    const params = useParams();
    const id = params?.id as string;

    const [article, setArticle] = setArticleState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    function setArticleState(val: any) {
        return useState<Article | null>(val);
    }

    useEffect(() => {
        if (id) fetchArticle();
    }, [id]);

    async function fetchArticle() {
        try {
            const res = await fetchApi(`/api/articles/${id}`);
            if (!res.ok) throw new Error('Article not found.');
            const result = await res.json();
            if (result.success) {
                setArticle(result.data);
            } else {
                throw new Error(result.message);
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }

    if (isLoading)
        return (
            <div className="flex flex-col items-center justify-center p-20 gap-4 opacity-30">
                <Loader2 className="h-8 w-8 animate-spin text-foreground" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] italic leading-none">
                    Accessing Article Node
                </span>
            </div>
        );

    if (error || !article)
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] p-10 text-center">
                <h2 className="text-2xl font-black tracking-tighter text-rose-500 mb-2 uppercase italic">
                    {error || 'Intel Missing'}
                </h2>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mb-8">
                    Archival node inaccessible.
                </p>
                <Button
                    variant="outline"
                    onClick={() => router.push('/articles')}
                    className="rounded-sm font-black text-[10px] uppercase tracking-widest px-10 h-10"
                >
                    Back to Archive
                </Button>
            </div>
        );

    const readTime = Math.ceil(article.body.length / 500);

    return (
        <div className="flex flex-col min-h-screen">
            {/* Header */}
            <div className="sticky top-0 z-40 bg-background/90 backdrop-blur-md px-4 py-12 md:px-12 mb-8 border-b border-border/20 flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => router.back()}
                        className="rounded-none h-11 w-11 border-border/20 hover:border-primary transition-all bg-card/10"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-black tracking-tighter uppercase italic leading-none text-foreground">
                            Transmission
                        </h1>
                        <p className="text-[10px] md:text-[11px] font-bold uppercase tracking-[0.4em] text-primary mt-2">
                            Single Feed View
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <Button
                        variant="outline"
                        size="icon"
                        className="rounded-none h-9 w-9 border-border/20 hover:border-primary/40 transition-colors"
                    >
                        <Bookmark className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        className="rounded-none h-9 w-9 border-border/20 hover:border-primary/40 transition-colors"
                    >
                        <Share className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <article className="px-4 max-w-4xl mx-auto w-full mb-16 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="space-y-10">
                    <div className="space-y-6 pb-8 border-b border-border/10">
                        <div className="badge-warm px-2 py-1">Transmission Editorial</div>
                        <h1 className="text-4xl sm:text-6xl font-bold tracking-tighter leading-tight uppercase italic text-foreground/90">
                            {article.title}
                        </h1>

                        <div className="flex items-center gap-4 pt-4 text-[9px] font-bold uppercase tracking-widest text-primary/40 italic">
                            <Calendar className="h-3.5 w-3.5" />
                            <span>
                                {new Date(article.createdAt).toLocaleDateString(undefined, {
                                    month: 'long',
                                    day: 'numeric',
                                    year: 'numeric',
                                })}
                            </span>
                            <span className="opacity-20">/</span>
                            <Clock className="h-3.5 w-3.5" />
                            <span>{readTime} MIN READ</span>
                        </div>
                    </div>

                    {article.banner && (
                        <div className="rounded-none overflow-hidden border border-border bg-muted/10 grayscale opacity-80">
                            <img
                                src={article.banner}
                                alt="banner"
                                className="w-full h-auto object-cover max-h-[600px]"
                            />
                        </div>
                    )}

                    <div className="flex items-center gap-5 py-8 border-y border-border/10">
                        <Link href={`/profile?username=${article.author?.username}`}>
                            <Avatar className="h-14 w-14 rounded-none border border-border/40 bg-muted/10 group">
                                <AvatarImage
                                    src={article.author?.avatar}
                                    className="object-cover"
                                />
                                <AvatarFallback className="text-xl font-bold uppercase">
                                    {article.author?.name?.[0] || 'A'}
                                </AvatarFallback>
                            </Avatar>
                        </Link>
                        <div className="flex flex-col flex-1">
                            <Link
                                href={`/profile?username=${article.author?.username}`}
                                className="font-bold text-xl hover:text-primary transition-colors uppercase italic leading-none"
                            >
                                {article.author?.name}
                            </Link>
                            <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/40 mt-2">
                                @{article.author?.username}
                            </span>
                        </div>
                        <FollowButton userId={article.author?.username} className="shrink-0" />
                    </div>

                    <div className="text-xl md:text-2xl leading-loose whitespace-pre-wrap font-medium text-foreground italic py-12">
                        {article.body}
                    </div>

                    <div className="pt-8 border-t border-border/10 flex items-center justify-between">
                        <div className="flex items-center gap-8">
                            <button className="flex items-center gap-2 text-muted-foreground/20 hover:text-rose-500 transition-colors group">
                                <Heart className="h-5 w-5" />
                                <span className="font-bold text-[9px] uppercase tracking-widest">
                                    0
                                </span>
                            </button>
                            <button className="flex items-center gap-2 text-muted-foreground/20 hover:text-primary transition-colors group">
                                <MessageSquare className="h-5 w-5" />
                                <span className="font-bold text-[9px] uppercase tracking-widest">
                                    0
                                </span>
                            </button>
                        </div>
                        <div className="text-[9px] font-bold text-primary/20 uppercase tracking-[0.3em] italic">
                            Identity Verified Archival
                        </div>
                    </div>

                    <div className="space-y-8 pt-16">
                        <div className="flex items-center gap-4 mb-4">
                            <h3 className="text-[9px] font-bold uppercase tracking-[0.4em] text-muted-foreground/40 italic">
                                Signal Echoes
                            </h3>
                            <div className="flex-1 h-px bg-border/20" />
                        </div>
                        <CommentList articleId={id} />
                    </div>
                </div>
            </article>

            <div className="pb-20" />
        </div>
    );
}

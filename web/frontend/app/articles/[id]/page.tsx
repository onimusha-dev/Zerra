'use client';

import React, { useEffect, useState } from 'react';
import { Calendar, Heart, Share, Bookmark, Clock, MessageSquare, ArrowLeft } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { fetchApi } from '@/lib/api';
import { CommentList } from '@/components/Comments';

interface ArticleAuthor {
    name: string;
    username: string;
    avatar?: string;
}

interface Article {
    id: string;
    title: string;
    body: string;
    banner?: string;
    createdAt: string;
    author: ArticleAuthor;
}

export default function ArticleViewPage() {
    const router = useRouter();
    const params = useParams();
    const id = params?.id as string;

    const [article, setArticle] = useState<Article | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) return;
        setIsLoading(true);
        fetchApi(`/api/articles/${id}`)
            .then((res) => {
                if (!res.ok) throw new Error('Article not found.');
                return res.json();
            })
            .then((result) => {
                if (result.success) setArticle(result.data);
                else throw new Error(result.message);
            })
            .catch((err) => setError(err.message))
            .finally(() => setIsLoading(false));
    }, [id]);

    if (isLoading)
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 opacity-25">
                <div className="h-7 w-7 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                <span className="text-[9px] font-black uppercase tracking-[0.4em]">
                    Loading Article
                </span>
            </div>
        );

    if (error || !article)
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] p-10 text-center gap-5">
                <h2 className="text-xl font-black tracking-tight text-rose-500 uppercase">
                    {error || 'Article not found'}
                </h2>
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground/40">
                    This archival node is inaccessible.
                </p>
                <Button
                    variant="outline"
                    onClick={() => router.push('/articles')}
                    className="rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] px-8 h-9"
                >
                    Back to Journal
                </Button>
            </div>
        );

    const readTime = Math.max(1, Math.ceil(article.body.split(' ').length / 200));
    const pubDate = new Date(article.createdAt).toLocaleDateString(undefined, {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    });

    return (
        <div className="flex flex-col min-h-screen">
            {/* Sticky header */}
            <div className="sticky top-0 z-40 bg-background/85 backdrop-blur-xl border-b border-border/8 px-4 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.back()}
                        className="rounded-2xl h-9 w-9 hover:bg-muted/50"
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <p className="text-sm font-black uppercase tracking-tight leading-none">
                            Journal
                        </p>
                        <p className="text-[9px] font-bold text-primary/50 uppercase tracking-[0.2em] mt-0.5">
                            Editorial
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-2xl h-9 w-9 text-muted-foreground/50 hover:text-primary"
                    >
                        <Bookmark className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-2xl h-9 w-9 text-muted-foreground/50 hover:text-primary"
                    >
                        <Share className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <article className="px-4 pt-8 pb-24 animate-in fade-in duration-500 max-w-prose mx-auto w-full">
                {/* Title block */}
                <div className="space-y-4 mb-8">
                    <h1 className="text-3xl font-black tracking-tight leading-tight capitalize text-foreground">
                        {article.title}
                    </h1>
                    <div className="flex items-center gap-4 text-[9px] font-bold uppercase tracking-widest text-muted-foreground/40">
                        <span className="flex items-center gap-1.5">
                            <Calendar className="h-3 w-3" />
                            {pubDate}
                        </span>
                        <span className="opacity-30">·</span>
                        <span className="flex items-center gap-1.5">
                            <Clock className="h-3 w-3" />
                            {readTime} min read
                        </span>
                    </div>
                </div>

                {/* Banner */}
                {article.banner && (
                    <div className="rounded-2xl overflow-hidden border border-border/10 mb-8">
                        <img
                            src={article.banner}
                            alt={article.title}
                            className="w-full object-cover max-h-[400px]"
                        />
                    </div>
                )}

                {/* Author */}
                <div className="flex items-center gap-4 py-5 mb-8 border-y border-border/8">
                    <Link href={`/profile?username=${article.author?.username}`}>
                        <Avatar className="h-11 w-11 rounded-2xl border border-border/10 hover:border-primary/30 transition-all">
                            <AvatarImage src={article.author?.avatar} className="object-cover" />
                            <AvatarFallback className="font-black uppercase bg-primary/10 text-primary text-sm">
                                {article.author?.name?.[0] || 'A'}
                            </AvatarFallback>
                        </Avatar>
                    </Link>
                    <div className="flex-1 min-w-0">
                        <Link
                            href={`/profile?username=${article.author?.username}`}
                            className="text-sm font-black uppercase tracking-tight hover:text-primary transition-colors block truncate"
                        >
                            {article.author?.name}
                        </Link>
                        <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground/35">
                            @{article.author?.username}
                        </span>
                    </div>
                </div>

                {/* Body */}
                <div className="text-base leading-[1.85] text-foreground/80 whitespace-pre-wrap mb-10 font-medium">
                    {article.body}
                </div>

                {/* Reactions */}
                <div className="flex items-center gap-6 py-6 border-t border-border/8 mb-10">
                    <button className="flex items-center gap-2 text-muted-foreground/30 hover:text-rose-500 transition-colors group">
                        <Heart className="h-5 w-5" />
                        <span className="text-[10px] font-black uppercase tracking-[0.15em]">
                            0
                        </span>
                    </button>
                    <button className="flex items-center gap-2 text-muted-foreground/30 hover:text-primary transition-colors group">
                        <MessageSquare className="h-5 w-5" />
                        <span className="text-[10px] font-black uppercase tracking-[0.15em]">
                            0
                        </span>
                    </button>
                    <div className="ml-auto flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-2xl h-8 w-8 text-muted-foreground/30 hover:text-primary"
                        >
                            <Share className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-2xl h-8 w-8 text-muted-foreground/30 hover:text-primary"
                        >
                            <Bookmark className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Comments */}
                <div id="comments" className="space-y-6">
                    <div className="flex items-center gap-3">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40">
                            Responses
                        </h3>
                        <div className="flex-1 h-px bg-border/10" />
                    </div>
                    <CommentList articleId={id} />
                </div>
            </article>
        </div>
    );
}

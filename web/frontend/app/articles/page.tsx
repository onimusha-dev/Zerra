'use client';

import React, { useEffect, useState } from 'react';
import { Loader2, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArticleCard, Article } from '@/components/FeedItem';
import { fetchApi } from '@/lib/api';

export default function ArticlesPage() {
    const router = useRouter();
    const [articles, setArticles] = useState<Article[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchArticles();
    }, []);

    async function fetchArticles() {
        try {
            const response = await fetchApi('/api/articles/');
            if (!response.ok) throw new Error('Could not fetch articles.');
            const result = await response.json();
            if (result.success) {
                setArticles(result.data || []);
            } else {
                setError(result.message || 'Failed to load articles.');
            }
        } catch (err: any) {
            setError(err.message || 'An error occurred.');
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="flex flex-col min-h-screen">
            {/* Header */}
            <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-sm px-2 py-8 mb-10 flex items-center justify-between border-b border-border/40">
                <div className="flex gap-4 items-center">
                    <Button
                        variant="outline"
                        size="icon"
                        className="rounded-sm h-9 w-9 border-border/60"
                        onClick={() => router.back()}
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tighter uppercase italic leading-none">
                            Journal
                        </h1>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground mt-1">
                            Archived Editorial Transmission
                        </p>
                    </div>
                </div>
                <Button
                    variant="outline"
                    className="rounded-sm h-9 font-black text-[10px] uppercase tracking-widest px-8 bg-foreground text-background hover:bg-foreground/90 transition-all"
                    onClick={() => router.push('/articles/new')}
                >
                    Connect New
                </Button>
            </div>

            {error && (
                <Alert
                    variant="destructive"
                    className="mb-8 rounded-sm border-destructive/20 bg-destructive/5 text-destructive font-black text-[10px] uppercase tracking-widest"
                >
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {/* Articles Grid/List */}
            <div className="space-y-6">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center p-20 gap-4 opacity-30">
                        <Loader2 className="h-8 w-8 animate-spin text-foreground" />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] italic leading-none">
                            Extracting Records
                        </span>
                    </div>
                ) : articles.length === 0 ? (
                    <div className="p-20 text-center border border-dashed border-border/40 rounded-sm">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-50">
                            Empty Editorial Repository
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {articles.map((article) => (
                            <ArticleCard key={article.id} article={article} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

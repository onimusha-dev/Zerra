'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/shared/PageHeader';
import { LoadingState } from '@/components/shared/LoadingState';
import { EmptyState } from '@/components/shared/EmptyState';
import { ArticleCard } from '@/components/feed/ArticleCard';
import { fetchApi } from '@/lib/api';
import { Article } from '@/types';

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
        <div className="flex flex-col min-h-screen pb-24">
            <PageHeader
                title="Journal"
                subtitle="Archived Editorial Transmission"
                actions={
                    <Button
                        className="rounded-2xl h-10 font-black text-[10px] uppercase tracking-widest px-6 bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all active:scale-95"
                        onClick={() => router.push('/articles/new')}
                    >
                        New Signal
                    </Button>
                }
            />

            <div className="px-4">
                {isLoading ? (
                    <LoadingState message="Extracting Records" />
                ) : articles.length === 0 ? (
                    <EmptyState title="Empty Editorial Repository" />
                ) : (
                    <div className="divide-y divide-border/5">
                        {articles.map((article, idx) => (
                            <div
                                key={article.id}
                                className="animate-in fade-in slide-in-from-bottom-2 duration-500"
                                style={{ animationDelay: `${idx * 40}ms` }}
                            >
                                <ArticleCard article={article} />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

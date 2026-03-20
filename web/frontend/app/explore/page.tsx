'use client';

import React, { useState } from 'react';
import MainLayout, { MobileSideBar, navItems } from '@/components/layout/main-layout';
import { Search, TrendingUp, Loader2 } from 'lucide-react';
import { useArticles } from '@/hooks/queries/useArticles';
import ArticleCard from '@/components/features/feed/article-card';
import { cn } from '@/lib/utils';
import { InfiniteScrollTrigger } from '@/components/ui/infinite-scroll-trigger';

export default function ExplorePage() {
    const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useArticles();
    const articles = data?.pages.flat() || [];
    const [activeTab, setActiveTab] = useState('trending');

    return (
        <MainLayout>
            <div className="flex flex-col border-b sticky top-0 bg-background/80 backdrop-blur-md z-10 px-4 pt-4">
                <div className="relative flex gap-2 mb-4">
                    <MobileSideBar navItems={navItems} />
                    <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary-foreground opacity-50" />
                    <input
                        type="text"
                        placeholder="Search Zerra"
                        className="w-full rounded-full bg-secondary-ui py-2.5 pl-11 pr-4 text-sm outline-none focus:ring-1 focus:ring-primary-ui focus:bg-background transition-all"
                    />
                </div>

                <div className="flex w-full">
                    {['trending', 'news', 'sports', 'tech'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className="relative flex-1 py-3 text-sm font-bold capitalize transition-colors"
                        >
                            <span
                                className={cn(
                                    activeTab === tab
                                        ? 'text-foreground'
                                        : 'text-secondary-foreground opacity-60',
                                )}
                            >
                                {tab}
                            </span>
                            {activeTab === tab && (
                                <div className="absolute bottom-0 left-1/2 h-1 w-10 -translate-x-1/2 rounded-full bg-primary-ui" />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex flex-col">
                {isLoading ? (
                    <div className="flex h-64 items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-primary-ui" />
                    </div>
                ) : articles.length > 0 ? (
                    <>
                        {articles.map((article) => (
                            <ArticleCard key={article.id} article={article} />
                        ))}
                        <InfiniteScrollTrigger
                            hasMore={!!hasNextPage}
                            isLoading={isFetchingNextPage}
                            onIntersect={() => fetchNextPage()}
                        />
                    </>
                ) : (
                    <div className="flex flex-col p-12 items-center text-center  ">
                        <TrendingUp className="h-10 w-10 text-primary-ui opacity-20 mb-4" />
                        <h3 className="text-xl font-bold">Nothing is trending yet</h3>
                        <p className="text-secondary-foreground opacity-60 max-w-xs mt-2">
                            Check back later to see what people are talking about on Zerra.
                        </p>
                    </div>
                )}
            </div>
        </MainLayout>
    );
}

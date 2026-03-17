'use client';

import { useQueryClient } from '@tanstack/react-query';
import MainLayout from '@/components/layout/main-layout';

import { Loader2, Sparkles, RefreshCw } from 'lucide-react';
import { useFeed, FeedItem } from '@/hooks/queries/useFeed';
import PostCard from '@/components/features/feed/post-card';
import ArticleCard from '@/components/features/feed/article-card';
import { InfiniteScrollTrigger } from '@/components/ui/infinite-scroll-trigger';
import ComposeBox from '@/components/features/feed/compose-box';

export default function Home() {
    const queryClient = useQueryClient();
    const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useFeed();

    const feedItems: FeedItem[] = data?.pages ? data.pages.flat() : [];

    return (
        <MainLayout>
            <div className="flex h-14 items-center border-b px-4 sticky top-0 bg-background/80 backdrop-blur-md z-20 justify-between">
                <h2 className="text-xl font-bold">Home</h2>
                <Sparkles className="h-5 w-5 text-primary-ui opacity-50" />
            </div>

            <ComposeBox />

            {/* Feed */}
            <div className="flex flex-col">
                {isLoading ? (
                    <div className="flex h-64 items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-primary-ui" />
                    </div>
                ) : feedItems.length > 0 ? (
                    <>
                        {feedItems.map((item, index) =>
                            item.type === 'post' ? (
                                <PostCard key={`post-${item.data.id}-${index}`} post={item.data} />
                            ) : (
                                <ArticleCard
                                    key={`article-${item.data.id}-${index}`}
                                    article={item.data}
                                />
                            ),
                        )}
                        <InfiniteScrollTrigger
                            hasMore={!!hasNextPage}
                            isLoading={isFetchingNextPage}
                            onIntersect={() => fetchNextPage()}
                        />
                        {!hasNextPage && feedItems.length > 0 && (
                            <div className="flex flex-col items-center justify-center py-16 border-t mt-2 text-center px-4 bg-linear-to-t from-secondary-ui/20 to-transparent">
                                <div className="h-12 w-12 rounded-full bg-secondary-ui flex items-center justify-center mb-4 shadow-sm border border-border-ui/50">
                                    <Sparkles className="h-6 w-6 text-primary-ui opacity-40" />
                                </div>
                                <h3 className="text-lg font-bold">You're all caught up!</h3>
                                <p className="text-sm text-secondary-foreground opacity-60 mb-6 mt-1 max-w-xs mx-auto">
                                    You've reached the end of your feed. Come back later or reload
                                    to start fresh!
                                </p>
                                <button
                                    onClick={() => {
                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                        setTimeout(() => {
                                            queryClient.resetQueries({
                                                queryKey: ['feed', 'for-you'],
                                            });
                                        }, 400); // Wait for scroll before clearing data
                                    }}
                                    className="flex items-center gap-2 rounded-full bg-primary-ui px-6 py-2.5 text-sm font-bold text-background transition-transform active:scale-95 hover:opacity-90 shadow-md"
                                >
                                    <RefreshCw className="h-4 w-4" />
                                    Reset & Reload Feed
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center p-12 text-center">
                        <div className="h-16 w-16 rounded-full bg-secondary-ui flex items-center justify-center mb-4">
                            <Sparkles className="h-8 w-8 text-primary-ui opacity-20" />
                        </div>
                        <h3 className="text-xl font-bold">Welcome to Zerra</h3>
                        <p className="text-secondary-foreground opacity-60 max-w-xs mx-auto mt-2">
                            The feed is looking a bit quiet. Be the first to share something with
                            the world!
                        </p>
                    </div>
                )}
            </div>
        </MainLayout>
    );
}

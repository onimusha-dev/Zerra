'use client';

import MainLayout, { navItems } from '@/components/layout/main-layout';
import { useBookmarks } from '@/hooks/queries/useBookmarks';
import PostCard from '@/components/features/feed/post-card';
import ArticleCard from '@/components/features/feed/article-card';
import { Loader2, Bookmark as BookmarkIcon } from 'lucide-react';
import { useAuthStore } from '@/stores/useAuthStore';
import { InfiniteScrollTrigger } from '@/components/ui/infinite-scroll-trigger';
import { MobileSideBar } from '@/components/layout/mobile-sidebar';

export default function BookmarksPage() {
    const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } =
        useBookmarks();
    const bookmarks = data?.pages.flat() || [];
    const { user } = useAuthStore();

    return (
        <MainLayout>
            <div className="flex h-14 items-center border-b px-4 sticky top-0 bg-background/80 backdrop-blur-md z-10 justify-between">
                <div className="flex gap-2   items-center">
                    <MobileSideBar navItems={navItems} />
                    <h2 className="text-xl font-bold">{user?.name || 'Bookmarks'}</h2>
                </div>
            </div>

            {isLoading ? (
                <div className="flex h-64 items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary-ui" />
                </div>
            ) : isError ? (
                <div className="flex flex-col items-center justify-center h-64 p-8 text-center">
                    <h3 className="text-lg font-bold">Something went wrong</h3>
                    <p className="text-secondary-foreground opacity-60">
                        Failed to load bookmarks. Please try again later.
                    </p>
                </div>
            ) : bookmarks.length > 0 ? (
                <div className="flex flex-col">
                    {bookmarks.map((item, index) => (
                        <div key={`${item.type}-${item.data.id}-${index}`}>
                            {item.type === 'post' ? (
                                <PostCard post={item.data} />
                            ) : (
                                <ArticleCard article={item.data} />
                            )}
                        </div>
                    ))}
                    <InfiniteScrollTrigger
                        hasMore={!!hasNextPage}
                        isLoading={isFetchingNextPage}
                        onIntersect={() => fetchNextPage()}
                    />
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center h-[60vh] p-8 text-center max-w-sm mx-auto  ">
                    <div className="h-20 w-20 rounded-full bg-secondary-ui flex items-center justify-center mb-6">
                        <BookmarkIcon className="h-10 w-10 text-primary-ui opacity-40 shrink-0" />
                    </div>
                    <h2 className="text-3xl font-bold mb-2">Save posts for later</h2>
                    <p className="text-secondary-foreground opacity-60">
                        Don&apos;t let the good stuff slip away! Bookmark posts and articles to
                        easily find them again in the future.
                    </p>
                </div>
            )}
        </MainLayout>
    );
}

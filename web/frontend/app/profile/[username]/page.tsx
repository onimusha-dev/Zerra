'use client';

import React, { useEffect, useState } from 'react';
import MainLayout from '@/components/layout/main-layout';
import { useProfile } from '@/hooks/queries/useProfile';
import { useUserPosts, useUserArticles } from '@/hooks/queries/useUserContent';
import { useAuthStore } from '@/stores/useAuthStore';
import ProfileHeader from '@/components/features/profile/profile-header';
import ProfileTabs from '@/components/features/profile/profile-tabs';
import PostCard from '@/components/features/feed/post-card';
import ArticleCard from '@/components/features/feed/article-card';
import { useUserLikes } from '@/hooks/queries/useUserLikes';
import { Post, Article } from '@/types/feed';
import { Loader2, Heart } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { InfiniteScrollTrigger } from '@/components/ui/infinite-scroll-trigger';

interface ProfilePageProps {
    params: Promise<{ username: string }>;
}

export default function ProfilePage({ params }: ProfilePageProps) {
    const { username } = React.use(params);
    const { data: response, isLoading: isProfileLoading, isError } = useProfile(username);
    const { user: currentUser, isAuthenticated, _hasHydrated } = useAuthStore();
    const router = useRouter();

    const [activeTab, setActiveTab] = useState('posts');

    const profile = response?.data;
    const posts = useUserPosts(profile?.id, { enabled: activeTab === 'posts' });
    const articles = useUserArticles(profile?.id, { enabled: activeTab === 'articles' });
    const likes = useUserLikes(username, profile?.id, { enabled: activeTab === 'likes' });

    const allPosts = posts.data?.pages.flat() || [];
    const allArticles = articles.data?.pages.flat() || [];
    const allLikes = likes.data?.pages.flat() || [];

    useEffect(() => {
        if (_hasHydrated && !isAuthenticated) {
            router.push('/auth/login');
        }
    }, [_hasHydrated, isAuthenticated, router]);

    if (!_hasHydrated || isProfileLoading) {
        return (
            <MainLayout>
                <div className="flex h-screen items-center justify-center">
                    <Loader2 className="h-10 w-10 animate-spin text-primary-ui" />
                </div>
            </MainLayout>
        );
    }

    if (isError || !profile) {
        return (
            <MainLayout>
                <div className="flex flex-col items-center justify-center h-[50vh] p-8 text-center">
                    <h2 className="text-2xl font-bold mb-2">This account doesn&apos;t exist</h2>
                    <p className="text-secondary-foreground opacity-60">
                        Try searching for another.
                    </p>
                </div>
            </MainLayout>
        );
    }

    const isOwn = currentUser?.username === username;

    return (
        <MainLayout>
            <ProfileHeader profile={profile} isOwn={isOwn} />
            <ProfileTabs
                activeTab={activeTab}
                onChange={setActiveTab}
                counts={{
                    posts: profile.postsCount,
                    articles: profile.articlesCount,
                    likes: profile.likesCount,
                }}
            />

            <div className="flex flex-col min-h-[400px]">
                {activeTab === 'posts' && (
                    <>
                        {posts.isLoading ? (
                            <div className="flex p-8 justify-center">
                                <Loader2 className="animate-spin text-primary-ui" />
                            </div>
                        ) : (
                            <>
                                {allPosts.length > 0 ? (
                                    allPosts
                                        .filter(Boolean)
                                        .map((post: Post) => <PostCard key={post.id} post={post} />)
                                ) : (
                                    <EmptyState owner={profile.username} type="posts" />
                                )}
                                <InfiniteScrollTrigger
                                    hasMore={!!posts.hasNextPage}
                                    isLoading={posts.isFetchingNextPage}
                                    onIntersect={() => posts.fetchNextPage()}
                                />
                            </>
                        )}
                    </>
                )}

                {activeTab === 'articles' && (
                    <>
                        {articles.isLoading ? (
                            <div className="flex p-8 justify-center">
                                <Loader2 className="animate-spin text-primary-ui" />
                            </div>
                        ) : (
                            <>
                                {allArticles.length > 0 ? (
                                    allArticles
                                        .filter(Boolean)
                                        .map((article: Article) => (
                                            <ArticleCard key={article.id} article={article} />
                                        ))
                                ) : (
                                    <EmptyState owner={profile.username} type="articles" />
                                )}
                                <InfiniteScrollTrigger
                                    hasMore={!!articles.hasNextPage}
                                    isLoading={articles.isFetchingNextPage}
                                    onIntersect={() => articles.fetchNextPage()}
                                />
                            </>
                        )}
                    </>
                )}

                {activeTab === 'likes' && (
                    <>
                        {likes.isLoading ? (
                            <div className="flex p-8 justify-center">
                                <Loader2 className="animate-spin text-primary-ui" />
                            </div>
                        ) : (
                            <>
                                {allLikes.length > 0 ? (
                                    allLikes
                                        .filter(Boolean)
                                        .map((item, index) => (
                                            <div key={`${item.type}-${item.data.id}-${index}`}>
                                                {item.type === 'post' ? (
                                                    <PostCard post={item.data} />
                                                ) : (
                                                    <ArticleCard article={item.data} />
                                                )}
                                            </div>
                                        ))
                                ) : (
                                    <EmptyState owner={profile.username} type="likes" />
                                )}
                                <InfiniteScrollTrigger
                                    hasMore={!!likes.hasNextPage}
                                    isLoading={likes.isFetchingNextPage}
                                    onIntersect={() => likes.fetchNextPage()}
                                />
                            </>
                        )}
                    </>
                )}

                {activeTab === 'replies' && (
                    <div className="flex flex-col p-12 items-center text-center">
                        <h3 className="text-xl font-bold">Coming soon</h3>
                        <p className="text-secondary-foreground opacity-60">
                            We are working on bringing {activeTab} to the profile page.
                        </p>
                    </div>
                )}
            </div>
        </MainLayout>
    );
}

function EmptyState({ owner, type }: { owner: string; type: string }) {
    return (
        <div className="flex flex-col p-12 items-center text-center">
            <div className="h-16 w-16 rounded-full bg-secondary-ui flex items-center justify-center mb-4">
                {type === 'likes' ? (
                    <Heart className="h-8 w-8 text-rose-500 opacity-20 fill-rose-500/20" />
                ) : (
                    <div className="h-8 w-8 text-primary-ui opacity-20 font-bold text-2xl uppercase">
                        {type[0] || '?'}
                    </div>
                )}
            </div>
            <h3 className="text-xl font-bold">No {type} yet</h3>
            <p className="text-secondary-foreground opacity-60">
                {type === 'likes'
                    ? `@${owner} hasn't liked any content yet. When they do, those likes will show up here.`
                    : `When @${owner} shares ${type}, they will show up here.`}
            </p>
        </div>
    );
}

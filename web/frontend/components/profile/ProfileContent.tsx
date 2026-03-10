import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PostCard, ArticleCard, FeedItemType } from '@/components/FeedItem';

interface ProfileContentProps {
    items: FeedItemType[];
}

export function ProfileContent({ items }: ProfileContentProps) {
    const posts = items.filter((i) => i.type === 'post');
    const articles = items.filter((i) => i.type === 'article');

    return (
        <Tabs defaultValue="posts" className="w-full">
            <TabsList className="w-full bg-transparent border-b-2 border-border/10 h-10 p-0 gap-10 justify-start rounded-none">
                <TabsTrigger
                    value="posts"
                    className="font-medium text-lg rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary bg-transparent pb-2 mt-2"
                >
                    Posts
                </TabsTrigger>
                <TabsTrigger
                    value="articles"
                    className="font-medium text-lg rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary bg-transparent pb-2 mt-2"
                >
                    Articles
                </TabsTrigger>
                <TabsTrigger
                    value="comments"
                    className="font-medium text-lg rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary bg-transparent pb-2 mt-2"
                >
                    Echoes
                </TabsTrigger>
                <TabsTrigger
                    value="likes"
                    className="font-medium text-lg rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary bg-transparent pb-2 mt-2"
                >
                    Likes
                </TabsTrigger>
            </TabsList>

            <TabsContent value="posts" className="pt-8 space-y-6">
                {posts.length > 0 ? (
                    posts.map((post, key) => (
                        <div key={key} className="border-b">
                            <PostCard key={post.id} post={post as any} />
                        </div>
                    ))
                ) : (
                    <EmptyStream label="No posts transmitted from this node." />
                )}
            </TabsContent>

            <TabsContent value="articles" className="pt-8 space-y-6">
                {articles.length > 0 ? (
                    articles.map((article, key) => (
                        <div key={key} className="border-b">
                            <ArticleCard key={article.id} article={article as any} />
                        </div>
                    ))
                ) : (
                    <EmptyStream label="No editorial records found." />
                )}
            </TabsContent>

            <TabsContent value="comments" className="pt-8 space-y-6">
                <EmptyStream label="No signal echoes detected." />
            </TabsContent>

            <TabsContent value="likes" className="pt-8 space-y-6">
                <EmptyStream label="No liked transmissions archived." />
            </TabsContent>
        </Tabs>
    );
}

function EmptyStream({ label }: { label?: string }) {
    return (
        <div className="p-20 text-center border border-dashed border-border/10 rounded-none bg-secondary/5">
            <p className="text-[10px] font-bold uppercase tracking-[0.4em] italic text-muted-foreground/20">
                {label || 'Transmission Void Detected'}
            </p>
        </div>
    );
}

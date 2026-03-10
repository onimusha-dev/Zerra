import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PostCard } from '@/components/feed/PostCard';
import { ArticleCard } from '@/components/feed/ArticleCard';
import { EmptyState } from '@/components/shared/EmptyState';
import { FeedItem } from '@/types';
import { FileText, MessageCircle, Heart, AlignLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProfileContentProps {
    items: FeedItem[];
}

function Tab({
    value,
    label,
    count,
    icon: Icon,
}: {
    value: string;
    label: string;
    count?: number;
    icon: any;
}) {
    return (
        <TabsTrigger
            value={value}
            className={cn(
                'relative flex items-center gap-1.5 px-1 pb-3 pt-1 rounded-none bg-transparent border-b-2 border-transparent text-muted-foreground/40',
                'font-black text-[11px] uppercase tracking-[0.15em]',
                'hover:text-foreground/60 transition-colors',
                'data-[state=active]:border-primary data-[state=active]:text-foreground',
            )}
        >
            <Icon className="h-3.5 w-3.5 shrink-0" />
            {label}
            {count !== undefined && count > 0 && (
                <span className="text-[9px] font-black bg-primary/10 text-primary px-1.5 py-0.5 rounded-full leading-none">
                    {count}
                </span>
            )}
        </TabsTrigger>
    );
}

export function ProfileContent({ items }: ProfileContentProps) {
    const posts = items.filter((i) => i.type === 'post');
    const articles = items.filter((i) => i.type === 'article');

    return (
        <Tabs defaultValue="posts" className="w-full">
            <TabsList className="w-full bg-transparent border-b border-border/10 h-auto p-0 gap-6 justify-start rounded-none">
                <Tab value="posts" label="Posts" count={posts.length} icon={AlignLeft} />
                <Tab value="articles" label="Journal" count={articles.length} icon={FileText} />
                <Tab value="replies" label="Replies" icon={MessageCircle} />
                <Tab value="likes" label="Likes" icon={Heart} />
            </TabsList>

            <TabsContent value="posts" className="mt-0">
                {posts.length > 0 ? (
                    posts.map((post, idx) => (
                        <div
                            key={post.id ?? idx}
                            className="animate-in fade-in duration-300"
                            style={{ animationDelay: `${idx * 25}ms` }}
                        >
                            <PostCard post={post as any} />
                        </div>
                    ))
                ) : (
                    <EmptyState
                        title="No posts yet"
                        description="This user hasn't posted anything yet."
                    />
                )}
            </TabsContent>

            <TabsContent value="articles" className="mt-0">
                {articles.length > 0 ? (
                    articles.map((article, idx) => (
                        <div
                            key={article.id ?? idx}
                            className="animate-in fade-in duration-300"
                            style={{ animationDelay: `${idx * 25}ms` }}
                        >
                            <ArticleCard article={article as any} />
                        </div>
                    ))
                ) : (
                    <EmptyState
                        title="No articles yet"
                        description="No journal entries published."
                    />
                )}
            </TabsContent>

            <TabsContent value="replies" className="mt-4">
                <EmptyState title="No replies yet" description="No comment activity found." />
            </TabsContent>

            <TabsContent value="likes" className="mt-4">
                <EmptyState title="No likes yet" description="Liked posts will appear here." />
            </TabsContent>
        </Tabs>
    );
}

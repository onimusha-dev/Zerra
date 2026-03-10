'use client';

import React from 'react';
import { Bookmark } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { LoadingState } from '@/components/shared/LoadingState';
import { EmptyState } from '@/components/shared/EmptyState';
import { FeedStream } from '@/components/feed/FeedStream';
import { useBookmarks } from '@/hooks/useBookmarks';

export default function BookmarksPage() {
    const { items, isLoading, error } = useBookmarks();

    return (
        <div className="flex flex-col min-h-screen pb-24">
            <PageHeader title="Bookmarks" subtitle="Saved Signal Repository" />

            <div className="px-4">
                {isLoading ? (
                    <LoadingState message="Decrypting Saved Archives" />
                ) : items.length === 0 ? (
                    <EmptyState
                        icon={Bookmark}
                        title="Empty Signal Cache"
                        description="No signals have been archived yet."
                    />
                ) : (
                    <FeedStream items={items} isLoading={false} error={error} />
                )}
            </div>
        </div>
    );
}

'use client';

import React from 'react';
import Link from 'next/link';
import { Verified } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn, formatDate } from '@/lib/utils';

interface FeedItemShellProps {
    author: {
        name: string;
        username: string;
        avatar?: string;
    };
    createdAt: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
    className?: string;
}

export function FeedItemShell({
    author,
    createdAt,
    children,
    footer,
    className,
}: FeedItemShellProps) {
    return (
        <div
            className={cn(
                'flex w-full items-start gap-4 py-6 transition-all duration-500 animate-in fade-in slide-in-from-bottom-2',
                className,
            )}
        >
            <div className="shrink-0">
                <Link href={`/profile?username=${author.username}`}>
                    <Avatar className="h-12 w-12 rounded-full border border-border/10 ring-2 ring-transparent group-hover:ring-primary/20 transition-all">
                        <AvatarImage src={author.avatar} className="object-cover" />
                        <AvatarFallback className="font-bold italic bg-muted text-foreground">
                            {(author.name || 'U')[0]}
                        </AvatarFallback>
                    </Avatar>
                </Link>
            </div>

            <div className="flex flex-col w-full min-w-0">
                <div className="flex flex-wrap gap-2 items-center text-sm">
                    <Link
                        href={`/profile?username=${author.username}`}
                        className="font-bold hover:text-primary transition-colors truncate"
                    >
                        {author.name}
                    </Link>
                    <Verified className="h-3.5 w-3.5 text-primary fill-current" />
                    <span className="opacity-40 truncate">@{author.username}</span>
                    <span className="opacity-20">·</span>
                    <span className="opacity-40 whitespace-nowrap">{formatDate(createdAt)}</span>
                </div>

                <div className="mt-2 min-w-0">{children}</div>

                {footer && (
                    <div className="mt-4 flex items-center justify-between w-full pr-2">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
}

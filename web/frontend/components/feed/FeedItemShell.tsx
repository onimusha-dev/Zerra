'use client';

import React from 'react';
import Link from 'next/link';
import { Verified } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn, formatDate } from '@/lib/utils';
import { Author } from '@/types';

interface FeedItemShellProps {
    author: Author;
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
                'flex w-full items-start gap-3.5 px-4 py-4 hover:bg-muted/10 transition-colors duration-150 border-b border-border/8',
                className,
            )}
        >
            {/* Avatar column */}
            <div className="shrink-0 pt-0.5">
                <Link href={`/profile?username=${author.username}`}>
                    <Avatar className="h-10 w-10 rounded-2xl border border-border/15 hover:border-primary/30 transition-colors">
                        <AvatarImage src={author.avatar} className="object-cover" />
                        <AvatarFallback className="font-black bg-primary/10 text-primary text-sm">
                            {(author.name || 'U')[0]}
                        </AvatarFallback>
                    </Avatar>
                </Link>
            </div>

            {/* Content column */}
            <div className="flex flex-col w-full min-w-0">
                {/* Header */}
                <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0 mb-1.5">
                    <Link
                        href={`/profile?username=${author.username}`}
                        className="text-sm font-black tracking-tight text-foreground hover:text-primary transition-colors"
                    >
                        {author.name}
                    </Link>
                    <Verified className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span className="text-[12px] text-muted-foreground/50 font-medium">
                        @{author.username}
                    </span>
                    <span className="text-muted-foreground/25 text-xs">·</span>
                    <span className="text-[12px] text-muted-foreground/50 font-medium whitespace-nowrap">
                        {formatDate(createdAt)}
                    </span>
                </div>

                {/* Body */}
                <div className="min-w-0">{children}</div>

                {/* Footer actions */}
                {footer && <div className="mt-3 flex items-center gap-1 -ml-2">{footer}</div>}
            </div>
        </div>
    );
}

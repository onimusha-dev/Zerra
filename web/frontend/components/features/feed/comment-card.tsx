import React from 'react';
import { formatRelativeTime } from '@/lib/time';
import { MessageCircle, Repeat2, Share2, MoreHorizontal } from 'lucide-react';
import Link from 'next/link';
import { cn, getMediaUrl } from '@/lib/utils';
import LikeButton from './like-button';
import { VerificationBadge } from '@/components/ui/verification-badge';

export default function CommentCard({ comment }: { comment: any }) {
    const { author, content, createdAt, _count, id } = comment;
    const avatarUrl = author?.avatar;

    return (
        <div className="flex w-full gap-3 border-b border-border-ui/50 p-4 transition-colors hover:bg-secondary-ui/5">
            <Link href={author ? `/profile/${author.username}` : '#'} className="shrink-0">
                <div className="h-10 w-10 overflow-hidden rounded-full bg-accent-ui border border-border-ui">
                    {avatarUrl ? (
                        <img
                            src={getMediaUrl(avatarUrl)}
                            alt={author?.name || 'Logo'}
                            className="h-full w-full object-cover select-none"
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs font-bold opacity-40">
                            {author?.name?.charAt(0) || '?'}
                        </div>
                    )}
                </div>
            </Link>

            <div className="flex flex-1 flex-col gap-1 min-w-0">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-[15px] min-w-0">
                        {author ? (
                            <>
                                <Link
                                    href={`/profile/${author.username}`}
                                    className="font-bold hover:underline flex items-center gap-1 truncate"
                                >
                                    <span className="truncate">{author.name}</span>
                                    {author.isVerified && <VerificationBadge size={14} />}
                                </Link>
                                <span className="text-secondary-foreground opacity-50 truncate">
                                    @{author.username}
                                </span>
                            </>
                        ) : (
                            <span className="text-secondary-foreground opacity-50">
                                Unknown User
                            </span>
                        )}
                        <span className="text-secondary-foreground opacity-30">·</span>
                        <span className="text-secondary-foreground opacity-50 hover:underline cursor-pointer">
                            {formatRelativeTime(createdAt)}
                        </span>
                    </div>
                    <button className="rounded-full p-2 text-secondary-foreground opacity-50 transition-colors hover:bg-primary-ui/10 hover:text-primary-ui">
                        <MoreHorizontal className="h-4 w-4" />
                    </button>
                </div>

                <div className="text-[15px] leading-normal whitespace-pre-wrap wrap-break-word mt-1">
                    {content}
                </div>

                <div className="mt-3 flex max-w-sm justify-between text-secondary-foreground opacity-60">
                    <button className="group flex items-center gap-2 transition-colors hover:text-primary-ui">
                        <div className="rounded-full p-2 group-hover:bg-primary-ui/10">
                            <MessageCircle className="h-[18px] w-[18px]" />
                        </div>
                        <span className="text-xs">{_count?.replies || 0}</span>
                    </button>

                    <button className="group flex items-center gap-2 transition-colors hover:text-emerald-500">
                        <div className="rounded-full p-2 group-hover:bg-emerald-500/10">
                            <Repeat2 className="h-[18px] w-[18px]" />
                        </div>
                        <span className="text-xs">0</span>
                    </button>

                    <LikeButton
                        itemId={id}
                        initialLiked={!!comment.liked}
                        initialCount={_count?.likes || 0}
                        type="comments"
                    />

                    <div className="flex items-center">
                        <button className="group flex items-center transition-colors hover:text-primary-ui ml-1">
                            <div className="rounded-full p-2 group-hover:bg-primary-ui/10">
                                <Share2 className="h-[18px] w-[18px]" />
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

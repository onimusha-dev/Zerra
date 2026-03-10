import { Heart, MessageCircle, Verified, Share, BarChart2, MoreHorizontal } from 'lucide-react';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn, formatDate } from '@/lib/utils';
import { Comment } from './types';
import { ActionButton } from '../feed/ActionButton';

interface CommentItemProps {
    comment: Comment;
}

export function CommentItem({ comment }: CommentItemProps) {
    const author = comment.author;

    return (
        <div className="flex w-full items-start gap-4 py-4 hover:bg-muted/10 transition-colors duration-300 animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-center gap-4">
                <Link href={`/profile?username=${author?.username}`}>
                    <Avatar className="h-10 w-10 rounded-full border border-border/10">
                        <AvatarImage src={author?.avatar} className="object-cover" />
                        <AvatarFallback className="font-bold">
                            {(author?.name || 'U')[0]}
                        </AvatarFallback>
                    </Avatar>
                </Link>
            </div>

            <div className="flex flex-col w-full">
                <div className="flex items-center justify-between">
                    <div className="flex gap-2 items-center">
                        <Link
                            href={`/profile?username=${author?.username}`}
                            className="font-bold hover:underline text-sm"
                        >
                            {author?.name}
                        </Link>
                        <Verified className="h-3.5 w-3.5 text-blue-600 fill-blue-600" />
                        <span className="text-sm opacity-50">@{author?.username}</span>
                        <span className="text-sm opacity-50">·</span>
                        <span className="text-sm opacity-50">{formatDate(comment.createdAt)}</span>
                    </div>
                    <button className="text-muted-foreground/30 hover:text-foreground transition-colors">
                        <MoreHorizontal className="h-4 w-4" />
                    </button>
                </div>

                <p className="text-sm leading-relaxed text-foreground mt-1 whitespace-pre-wrap">
                    {comment.content}
                </p>

                <div className="flex items-center justify-between w-full max-w-sm mt-3 -ml-2">
                    <ActionButton
                        icon={MessageCircle}
                        count={comment._count?.replies || 0}
                        size={18}
                        color="primary"
                    />
                    <ActionButton
                        icon={Heart}
                        count={comment._count?.likes || 0}
                        size={18}
                        color="rose-500"
                        active={comment.liked}
                    />
                    <ActionButton icon={BarChart2} count={0} size={18} color="sky-500" />
                    <button className="p-2 text-muted-foreground/30 hover:text-primary transition-colors">
                        <Share className="h-3.5 w-3.5" />
                    </button>
                </div>
            </div>
        </div>
    );
}

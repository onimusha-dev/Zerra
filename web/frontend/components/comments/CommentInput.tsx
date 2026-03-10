import React from 'react';
import { Loader2, Send, ImageIcon, Smile } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface CommentInputProps {
    newComment: string;
    setNewComment: (val: string) => void;
    isPosting: boolean;
    handlePostComment: () => void;
}

import { ActionButton } from '../feed/ActionButton';

export function CommentInput({
    newComment,
    setNewComment,
    isPosting,
    handlePostComment,
}: CommentInputProps) {
    return (
        <div className="py-4 border-b border-border/10">
            <div className="flex gap-4">
                <div className="flex-1 space-y-4">
                    <Textarea
                        placeholder="Post your reply"
                        className="w-full border-none shadow-none focus-visible:ring-0 text-lg md:text-xl font-medium p-0 min-h-[120px] resize-none bg-transparent placeholder:text-muted-foreground/40 leading-relaxed"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                    />
                    <div className="flex justify-between items-center pt-2">
                        <div className="flex items-center gap-1 -ml-2">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 text-primary hover:bg-primary/10 rounded-full transition-colors"
                            >
                                <ImageIcon className="h-5 w-5" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 text-primary hover:bg-primary/10 rounded-full transition-colors"
                            >
                                <Smile className="h-5 w-5" />
                            </Button>
                        </div>
                        <Button
                            onClick={handlePostComment}
                            disabled={!newComment.trim() || isPosting}
                            className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-6 h-9 transition-all active:scale-95 disabled:opacity-50"
                        >
                            {isPosting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Broadcast'}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

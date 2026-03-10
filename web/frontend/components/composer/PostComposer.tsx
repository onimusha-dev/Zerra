'use client';

import React, { useRef } from 'react';
import { ImageIcon, Smile, List, Link2, X, Loader2, Send } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

interface PostComposerProps {
    user: { name?: string; avatar?: string } | null;
    content: string;
    setContent: (val: string) => void;
    banner: string;
    setBanner: (val: string) => void;
    isPosting: boolean;
    handleCreatePost: () => void;
}

const TOOLBAR_BUTTONS = [
    { icon: ImageIcon, label: 'Image', active: true },
    { icon: List, label: 'Poll', active: true },
    { icon: Smile, label: 'Emoji', active: true },
    { icon: Link2, label: 'Link', active: true },
] as const;

export function PostComposer({
    user,
    content,
    setContent,
    banner,
    setBanner,
    isPosting,
    handleCreatePost,
}: PostComposerProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [showBannerInput, setShowBannerInput] = React.useState(false);
    const canPost = content.trim().length > 0 && !isPosting;
    const charCount = content.length;
    const MAX_CHARS = 500;
    const nearLimit = charCount > MAX_CHARS * 0.8;
    const overLimit = charCount > MAX_CHARS;

    // Auto-resize textarea
    const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setContent(e.target.value);
        const el = e.target;
        el.style.height = 'auto';
        el.style.height = `${el.scrollHeight}px`;
    };

    const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if ((e.metaKey || e.ctrlKey) && e.key === 'Enter' && canPost) {
            e.preventDefault();
            handleCreatePost();
        }
    };

    return (
        <div className="px-4 py-4 border-b border-border/10">
            <div className="flex gap-3">
                {/* Avatar */}
                <Avatar className="h-10 w-10 rounded-2xl border border-border/10 shrink-0 mt-0.5">
                    <AvatarImage src={user?.avatar} className="object-cover" />
                    <AvatarFallback className="font-black text-sm bg-primary/10 text-primary">
                        {(user?.name || 'Z')[0]}
                    </AvatarFallback>
                </Avatar>

                {/* Input area */}
                <div className="flex-1 min-w-0">
                    <textarea
                        ref={textareaRef}
                        placeholder="What's on your mind?"
                        className="w-full border-none bg-transparent resize-none outline-none text-[15px] leading-[1.6] font-medium placeholder:text-muted-foreground/35 text-foreground/95 min-h-[72px] max-h-[320px] overflow-y-auto"
                        value={content}
                        onChange={handleInput}
                        onKeyDown={handleKey}
                        rows={3}
                    />

                    {/* Banner preview */}
                    {banner && (
                        <div className="relative rounded-2xl overflow-hidden border border-border/15 mt-2 mb-3">
                            <img
                                src={banner}
                                alt="preview"
                                className="w-full max-h-72 object-cover"
                            />
                            <button
                                onClick={() => {
                                    setBanner('');
                                    setShowBannerInput(false);
                                }}
                                className="absolute top-2 right-2 h-7 w-7 rounded-full bg-background/80 backdrop-blur-sm border border-border/20 flex items-center justify-center hover:bg-background transition-colors"
                            >
                                <X className="h-3.5 w-3.5" />
                            </button>
                        </div>
                    )}

                    {/* Banner URL input */}
                    {showBannerInput && !banner && (
                        <div className="flex items-center gap-2 mt-2 mb-3 px-3 py-2 rounded-xl bg-muted/20 border border-border/10 focus-within:border-primary/30 transition-colors">
                            <Link2 className="h-3.5 w-3.5 text-muted-foreground/40 shrink-0" />
                            <input
                                autoFocus
                                type="url"
                                placeholder="Paste image URL…"
                                className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/35"
                                value={banner}
                                onChange={(e) => setBanner(e.target.value)}
                                onKeyDown={(e) => e.key === 'Escape' && setShowBannerInput(false)}
                            />
                        </div>
                    )}

                    {/* Footer: toolbar + char count + submit */}
                    <div className="flex items-center justify-between pt-3 border-t border-border/8 mt-1">
                        {/* Toolbar */}
                        <div className="flex items-center gap-0.5 -ml-1.5">
                            {TOOLBAR_BUTTONS.map(({ icon: Icon, label }) => (
                                <button
                                    key={label}
                                    title={label}
                                    onClick={
                                        label === 'Link'
                                            ? () => setShowBannerInput((v) => !v)
                                            : undefined
                                    }
                                    className="h-9 w-9 flex items-center justify-center rounded-xl text-primary/60 hover:text-primary hover:bg-primary/8 transition-all"
                                >
                                    <Icon className="h-4.5 w-4.5" />
                                </button>
                            ))}
                        </div>

                        {/* Right: char count + submit */}
                        <div className="flex items-center gap-3">
                            {charCount > 0 && (
                                <span
                                    className={`text-[11px] font-bold tabular-nums transition-colors ${
                                        overLimit
                                            ? 'text-rose-500'
                                            : nearLimit
                                              ? 'text-amber-500'
                                              : 'text-muted-foreground/30'
                                    }`}
                                >
                                    {MAX_CHARS - charCount}
                                </span>
                            )}
                            <Button
                                onClick={handleCreatePost}
                                disabled={!canPost || overLimit}
                                size="sm"
                                className="rounded-full px-5 h-9 font-black text-[11px] uppercase tracking-[0.15em] shadow-md shadow-primary/20 disabled:opacity-30 transition-all active:scale-95"
                            >
                                {isPosting ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                    <>
                                        <Send className="h-3.5 w-3.5 mr-1.5" />
                                        Post
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

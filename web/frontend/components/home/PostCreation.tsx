'use client';

import React from 'react';
import { Loader2, ImageIcon, Smile, List, Calendar, MapPin } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface PostCreationProps {
    user: any;
    content: string;
    setContent: (val: string) => void;
    banner: string;
    setBanner: (val: string) => void;
    isPosting: boolean;
    handleCreatePost: () => void;
}

export function PostCreation({
    user,
    content,
    setContent,
    banner,
    setBanner,
    isPosting,
    handleCreatePost,
}: PostCreationProps) {
    return (
        <div className="py-4 border-b border-border/10">
            <div className="flex gap-4">
                <Avatar className="h-12 w-12 rounded-full border border-border/10 shrink-0">
                    <AvatarImage src={user?.avatar} className="object-cover" />
                    <AvatarFallback className="font-bold">{(user?.name || 'U')[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                    <Textarea
                        placeholder="What's happening?"
                        className="w-full border-none shadow-none focus-visible:ring-0 text-xl md:text-2xl font-medium p-0 min-h-[140px] resize-none bg-transparent placeholder:text-muted-foreground/40 leading-relaxed"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                    />

                    {banner && (
                        <div className="relative rounded-2xl overflow-hidden border border-border/10 aspect-video mb-4 group">
                            <img
                                src={banner}
                                alt="preview"
                                className="w-full h-full object-cover"
                            />
                            <Button
                                variant="destructive"
                                size="icon"
                                className="absolute top-2 right-2 h-8 w-8 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-sm border-none transition-all"
                                onClick={() => setBanner('')}
                            >
                                <span className="text-sm font-bold">✕</span>
                            </Button>
                        </div>
                    )}

                    <div className="flex items-center justify-between pt-4">
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
                                className="h-9 w-9 text-primary hover:bg-primary/10 rounded-full transition-colors hidden sm:flex"
                            >
                                <List className="h-5 w-5" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 text-primary hover:bg-primary/10 rounded-full transition-colors hidden sm:flex"
                            >
                                <Smile className="h-5 w-5" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 text-primary hover:bg-primary/10 rounded-full transition-colors hidden sm:flex"
                            >
                                <Calendar className="h-5 w-5" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 text-primary hover:bg-primary/10 rounded-full transition-colors opacity-50 cursor-not-allowed"
                            >
                                <MapPin className="h-5 w-5" />
                            </Button>

                            <div className="h-8 w-px bg-border/10 mx-2" />

                            <div className="flex items-center h-8 px-3 rounded-full bg-muted/20 border border-border/10 focus-within:border-primary/40 transition-colors">
                                <input
                                    type="text"
                                    placeholder="Media Link"
                                    className="bg-transparent border-none text-[10px] font-bold uppercase tracking-wider text-foreground focus:outline-none placeholder:text-muted-foreground/30 w-24 sm:w-32"
                                    value={banner}
                                    onChange={(e) => setBanner(e.target.value)}
                                />
                            </div>
                        </div>

                        <Button
                            onClick={handleCreatePost}
                            disabled={!content.trim() || isPosting}
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

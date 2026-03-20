'use client';

import React, { useState } from 'react';
import { useAuthStore } from '@/stores/useAuthStore';
import { User, Image as ImageIcon, Loader2, AlertCircle } from 'lucide-react';
import { useCreatePost } from '@/hooks/queries/usePosts';
import { cn, getMediaUrl } from '@/lib/utils';
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from 'framer-motion';

export default function ComposeBox() {
    const { user } = useAuthStore();
    const [content, setContent] = useState('');
    const [media, setMedia] = useState<File | null>(null);
    const [mediaPreview, setMediaPreview] = useState<string | null>(null);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const { mutateAsync: createPost, isPending } = useCreatePost();
    const [isVisible, setIsVisible] = useState(true);
    const { scrollY } = useScroll();

    useMotionValueEvent(scrollY, 'change', (latest) => {
        const previous = scrollY.getPrevious() || 0;
        if (latest > previous && latest > 100) {
            setIsVisible(false);
        } else if (latest < previous) {
            setIsVisible(true);
        }
        if (latest < 20) {
            setIsVisible(true);
        }
    });

    const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setMedia(file);
            const url = URL.createObjectURL(file);
            setMediaPreview(url);
        }
    };

    const removeMedia = () => {
        setMedia(null);
        if (mediaPreview) URL.revokeObjectURL(mediaPreview);
        setMediaPreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (published: boolean = true) => {
        if ((!content.trim() && !media) || isPending) return;
        try {
            setError(null);
            await createPost({ content, media: media || undefined, published });
            setContent('');
            removeMedia();
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'Failed to create post');
            console.error('Failed to create post', err);
        }
    };

    return (
        <motion.div
            initial={{ y: 0, opacity: 1 }}
            animate={{ y: isVisible ? 0 : -100, opacity: isVisible ? 1 : 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="sticky top-14 z-10 w-full border-b bg-background/95 backdrop-blur-md p-4 pt-3 flex flex-col gap-3"
        >
            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="bg-destructive/10 text-destructive text-xs px-3 py-2 rounded-lg font-medium flex items-center gap-2">
                            <AlertCircle className="h-3.5 w-3.5" />
                            {error}
                            <button
                                onClick={() => setError(null)}
                                className="ml-auto hover:opacity-70"
                            >
                                ✕
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            <div className="flex gap-3 w-full">
                <div className="h-10 w-10 shrink-0 rounded-full bg-secondary-ui flex items-center justify-center overflow-hidden border border-border-ui">
                    {user?.avatar ? (
                        <img
                            src={getMediaUrl(user.avatar)}
                            alt="Avatar"
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        <User className="h-5 w-5 opacity-40" />
                    )}
                </div>
                <div className="flex grow flex-col gap-2">
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="What's happening?!"
                        className="w-full resize-none border-none bg-transparent text-lg outline-none placeholder:text-foreground/40 mt-1.5 focus:ring-0"
                        rows={1}
                        onInput={(e) => {
                            e.currentTarget.style.height = 'auto';
                            e.currentTarget.style.height =
                                Math.min(e.currentTarget.scrollHeight, 200) + 'px';
                        }}
                    />
                    {mediaPreview && (
                        <div className="relative mt-2 rounded-2xl overflow-hidden border border-border-ui w-fit max-w-full">
                            <img
                                src={mediaPreview}
                                alt="Preview"
                                className="max-h-75 object-contain bg-secondary-ui/20"
                            />
                            <button
                                onClick={removeMedia}
                                className="absolute top-2 right-2 h-8 w-8 bg-black/60 text-white rounded-full flex items-center justify-center hover:bg-black transition-colors"
                            >
                                ✕
                            </button>
                        </div>
                    )}
                    <div className="flex w-full items-center justify-between mt-2 pt-2 border-t">
                        <div className="flex items-center gap-1 text-primary-ui">
                            <input
                                type="file"
                                accept="image/*,video/*"
                                ref={fileInputRef}
                                onChange={handleMediaChange}
                                className="hidden"
                                id="post-media-upload"
                            />
                            <label
                                htmlFor="post-media-upload"
                                className="rounded-full p-2 hover:bg-primary-ui/10 transition-colors cursor-pointer"
                            >
                                <ImageIcon className="h-5 w-5" />
                            </label>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <span
                                    className={cn(
                                        'text-xs font-medium  ',
                                        !user?.isVerified && content.length > 500
                                            ? 'text-red-500'
                                            : 'text-secondary-foreground opacity-40',
                                    )}
                                >
                                    {content.length}
                                    {!user?.isVerified && ' / 500'}
                                </span>
                                <div className="h-4 w-px bg-border-ui opacity-20" />
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handleSubmit(false)}
                                    disabled={
                                        (!content.trim() && !media) ||
                                        isPending ||
                                        (!user?.isVerified && content.length > 500)
                                    }
                                    className="rounded-full border border-border-ui px-4 py-1.5 text-sm font-bold hover:bg-secondary-ui transition-colors disabled:opacity-50"
                                >
                                    Draft
                                </button>
                                <button
                                    onClick={() => handleSubmit(true)}
                                    disabled={
                                        (!content.trim() && !media) ||
                                        isPending ||
                                        (!user?.isVerified && content.length > 500)
                                    }
                                    className="flex items-center gap-2 rounded-full bg-foreground px-5 py-1.5 font-bold text-background transition-transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
                                >
                                    {isPending ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        'Post'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/main-layout';
import { useCreateArticle } from '@/hooks/queries/useArticles';
import { useAuthStore } from '@/stores/useAuthStore';
import { ArrowLeft, Loader2, Image as ImageIcon, X, Check } from 'lucide-react';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function CreateArticlePage() {
    const router = useRouter();
    const { mutateAsync: createArticle, isPending } = useCreateArticle();
    const { user } = useAuthStore();

    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [banner, setBanner] = useState<File | null>(null);
    const [bannerPreview, setBannerPreview] = useState<string | null>(null);
    const [isPreview, setIsPreview] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setBanner(file);
            const url = URL.createObjectURL(file);
            setBannerPreview(url);
        }
    };

    const removeMedia = () => {
        setBanner(null);
        if (bannerPreview) {
            URL.revokeObjectURL(bannerPreview);
        }
        setBannerPreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSave = async (published: boolean = true) => {
        if (!title.trim() || !body.trim() || isPending) return;

        try {
            const result = await createArticle({
                title: title.trim(),
                body: body.trim(),
                banner: banner || undefined,
                published,
                enableComments: true,
            });

            const createdArticleId = result?.data?.id || result?.id;
            if (published && createdArticleId) {
                router.push(`/articles/${createdArticleId}`);
            } else {
                router.push('/profile/' + user?.username);
            }
        } catch (error) {
            console.error(`Failed to ${published ? 'publish' : 'save'} article`, error);
        }
    };

    return (
        <MainLayout hideSidebar>
            <div className="flex flex-col min-h-screen">
                {/* Header */}
                <div className="flex h-14 items-center justify-between border-b px-4 sticky top-0 bg-background/80 backdrop-blur-md z-20">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.back()}
                            className="rounded-full p-2 hover:bg-secondary-ui transition-colors text-foreground"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </button>
                        <h2 className="text-xl font-bold">Write Article</h2>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setIsPreview(!isPreview)}
                            className="rounded-full px-4 py-1.5 text-sm font-bold border border-border-ui hover:bg-secondary-ui transition-colors text-foreground"
                        >
                            {isPreview ? 'Edit' : 'Preview'}
                        </button>
                        <button
                            onClick={() => handleSave(false)}
                            disabled={!title.trim() || !body.trim() || isPending}
                            className="rounded-full px-4 py-1.5 text-sm font-bold border border-border-ui hover:bg-secondary-ui transition-colors text-foreground disabled:opacity-50"
                        >
                            Save as Draft
                        </button>
                        <button
                            onClick={() => handleSave(true)}
                            disabled={!title.trim() || !body.trim() || isPending}
                            className="flex items-center gap-2 rounded-full bg-primary-ui px-4 py-1.5 text-sm font-bold text-background transition-all hover:opacity-90 disabled:opacity-50"
                        >
                            {isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Check className="h-4 w-4" />
                            )}
                            Publish
                        </button>
                    </div>
                </div>

                {/* Main Editor Content */}
                {!isPreview ? (
                    <div className="flex flex-col p-6 w-full max-w-3xl mx-auto gap-6 flex-1">
                        {/* Banner Upload */}
                        <div className="flex flex-col gap-2">
                            {bannerPreview ? (
                                <div className="relative w-full overflow-hidden rounded-2xl border border-border-ui bg-secondary-ui/20 aspect-video">
                                    <img
                                        src={bannerPreview}
                                        alt="Banner Preview"
                                        className="h-full w-full object-cover"
                                    />
                                    <button
                                        onClick={removeMedia}
                                        className="absolute right-3 top-3 rounded-full bg-black/60 p-1.5 text-white backdrop-blur-md transition-colors hover:bg-black/80"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="flex flex-col items-center justify-center w-full aspect-21/9 rounded-2xl border-2 border-dashed border-border-ui bg-secondary-ui/10 hover:bg-secondary-ui/30 hover:border-primary-ui/30 transition-all gap-3 overflow-hidden group"
                                >
                                    <div className="p-4 rounded-full bg-secondary-ui group-hover:scale-110 transition-transform">
                                        <ImageIcon className="h-8 w-8 text-foreground/50" />
                                    </div>
                                    <div className="text-center font-medium opacity-60">
                                        <p>Click to add a cover image</p>
                                    </div>
                                </button>
                            )}
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={handleMediaChange}
                            />
                        </div>

                        {/* Title Input */}
                        <textarea
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Article Title..."
                            autoFocus
                            className="w-full resize-none border-none bg-transparent text-4xl font-black outline-none placeholder:text-foreground/30 leading-tight focus:ring-0"
                            rows={1}
                            onInput={(e) => {
                                e.currentTarget.style.height = 'auto';
                                e.currentTarget.style.height = e.currentTarget.scrollHeight + 'px';
                            }}
                        />

                        {/* Body Input */}
                        <textarea
                            value={body}
                            onChange={(e) => setBody(e.target.value)}
                            placeholder="Write your story here... (Markdown supported)"
                            className="w-full flex-1 resize-none border-none bg-transparent text-lg outline-none placeholder:text-foreground/30 leading-relaxed focus:ring-0 min-h-[500px]"
                        />
                    </div>
                ) : (
                    <div className="flex flex-col p-6 w-full max-w-3xl mx-auto gap-6 flex-1">
                        {/* Banner Preview Mode */}
                        {bannerPreview && (
                            <div className="w-full overflow-hidden rounded-2xl border border-border-ui">
                                <img
                                    src={bannerPreview}
                                    alt="Banner"
                                    className="w-full object-cover"
                                />
                            </div>
                        )}

                        {/* Title Preview Mode */}
                        <h1 className="text-4xl font-black leading-tight text-foreground">
                            {title || 'Untitled Article'}
                        </h1>

                        {/* Body Markdown Renderer */}
                        <div className="prose prose-neutral dark:prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-secondary-ui prose-pre:border prose-pre:border-border-ui prose-a:text-primary-ui">
                            {body ? (
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>{body}</ReactMarkdown>
                            ) : (
                                <p className="opacity-40 italic">No content to preview.</p>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </MainLayout>
    );
}

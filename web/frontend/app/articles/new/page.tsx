'use client';

import React, { useState } from 'react';
import { ArrowLeft, Loader2, Send, MessageSquare, Globe, XCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { fetchApi } from '@/lib/api';

export default function NewArticlePage() {
    const router = useRouter();
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [enableComments, setEnableComments] = useState(true);
    const [isPublishing, setIsPublishing] = useState(false);
    const [banner, setBanner] = useState('');
    const [error, setError] = useState<string | null>(null);

    React.useEffect(() => {
        fetchApi('/api/users/me').then((res) => {
            if (!res.ok) router.push('/auth/login');
        });
    }, []);

    async function handlePublish() {
        if (!title.trim() || !body.trim()) {
            setError('Incomplete data. Title and body required.');
            return;
        }

        setIsPublishing(true);
        setError(null);

        try {
            const res = await fetchApi('/api/articles/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                body: JSON.stringify({
                    title,
                    body,
                    banner: banner.trim() || undefined,
                    published: true,
                    enableComments,
                }),
            });

            const result = await res.json();

            if (res.ok && result.success) {
                router.push('/articles');
            } else {
                throw new Error(result.message || 'Archive failure.');
            }
        } catch (err: any) {
            setError(err.message || 'Synchronization error.');
        } finally {
            setIsPublishing(false);
        }
    }

    return (
        <div className="flex flex-col min-h-screen">
            {/* Header */}
            <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-sm px-2 py-8 mb-10 flex items-center justify-between border-b border-border/40">
                <div className="flex items-center gap-4">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => router.back()}
                        className="rounded-sm h-9 w-9 border-border/60"
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tighter uppercase italic leading-none">
                            Studio
                        </h1>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground mt-1">
                            Editorial Archival Node
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        onClick={handlePublish}
                        disabled={isPublishing || !title.trim() || !body.trim()}
                        className="rounded-sm font-black text-[10px] uppercase tracking-widest px-8 h-10 bg-foreground text-background"
                    >
                        {isPublishing ? (
                            <Loader2 className="h-3 w-3 animate-spin mr-2" />
                        ) : (
                            <Send className="h-3 w-3 mr-2" />
                        )}
                        Transmit
                    </Button>
                </div>
            </div>

            <div className="flex-1 max-w-4xl mx-auto w-full space-y-10 pb-32 px-2">
                {error && (
                    <Alert
                        variant="destructive"
                        className="rounded-sm border-destructive/20 bg-destructive/5"
                    >
                        <AlertDescription className="text-[10px] font-black uppercase tracking-widest">
                            {error}
                        </AlertDescription>
                    </Alert>
                )}

                <div className="minimal-card p-10 space-y-10 border-border/60">
                    <div className="space-y-6">
                        <div className="space-y-4">
                            <Input
                                placeholder="Banner Image Identifier (URL)"
                                value={banner}
                                onChange={(e) => setBanner(e.target.value)}
                                className="bg-muted/30 border-border/40 rounded-sm h-10 px-4 font-bold tracking-tight text-xs focus-visible:ring-0 placeholder:text-muted-foreground/30"
                            />
                            {banner && (
                                <div className="relative rounded-sm overflow-hidden border border-border/40 aspect-video max-h-64 bg-muted/20">
                                    <img
                                        src={banner}
                                        alt="banner preview"
                                        className="w-full h-full object-cover"
                                    />
                                    <Button
                                        variant="destructive"
                                        size="icon"
                                        className="absolute top-2 right-2 rounded-sm h-8 w-8"
                                        onClick={() => setBanner('')}
                                    >
                                        <XCircle className="h-4 w-4" />
                                    </Button>
                                </div>
                            )}
                        </div>

                        <div className="space-y-4">
                            <Input
                                placeholder="Archival Title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="border-none shadow-none text-4xl sm:text-5xl font-black p-0 h-auto focus-visible:ring-0 placeholder:text-muted-foreground/10 bg-transparent tracking-tighter italic uppercase"
                                maxLength={100}
                            />
                            <div className="h-px bg-border/40 w-full" />
                        </div>

                        <Textarea
                            placeholder="Engage transmission core..."
                            value={body}
                            onChange={(e) => setBody(e.target.value)}
                            className="border-none shadow-none text-lg p-0 min-h-[500px] focus-visible:ring-0 resize-none bg-transparent leading-relaxed placeholder:text-muted-foreground/10 font-medium italic"
                        />
                    </div>
                </div>

                {/* Configuration Bar */}
                <div className="minimal-card p-6 flex flex-col sm:flex-row gap-8 items-center justify-between border-border/60">
                    <div className="flex items-center gap-8">
                        <div
                            className="flex items-center gap-5 group cursor-pointer"
                            onClick={() => setEnableComments(!enableComments)}
                        >
                            <div className="h-10 w-10 bg-muted/50 rounded-sm flex items-center justify-center border border-border">
                                <MessageSquare className="h-4 w-4" />
                            </div>
                            <div className="flex flex-col">
                                <Label className="font-bold text-[10px] uppercase tracking-widest cursor-pointer leading-none mb-1 italic">
                                    Intel Loop
                                </Label>
                                <span className="text-[10px] text-muted-foreground/40 font-black uppercase tracking-widest">
                                    Enable Commentary
                                </span>
                            </div>
                            <Switch
                                checked={enableComments}
                                onCheckedChange={setEnableComments}
                                className="ml-4"
                            />
                        </div>

                        <div className="flex items-center gap-5 opacity-20 filter grayscale">
                            <div className="h-10 w-10 bg-muted/50 rounded-sm flex items-center justify-center border border-border">
                                <Globe className="h-4 w-4" />
                            </div>
                            <div className="flex flex-col">
                                <Label className="font-bold text-[10px] uppercase tracking-widest leading-none mb-1 italic">
                                    Global Sync
                                </Label>
                                <span className="text-[10px] text-muted-foreground/40 font-black uppercase tracking-widest">
                                    Public Domain
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="hidden sm:block">
                        <span className="text-[8px] font-black uppercase tracking-[0.5em] text-muted-foreground/20 italic">
                            Studio Mode Alpha · v1.0
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}

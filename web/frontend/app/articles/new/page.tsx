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
        <div className="flex flex-col min-h-screen bg-background selection:bg-primary selection:text-primary-foreground">
            {/* Immersive Header */}
            <div className="sticky top-0 z-50 bg-background/60 backdrop-blur-3xl px-6 py-6 border-b border-border/10 flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.back()}
                        className="rounded-xl h-12 w-12 hover:bg-muted/50 transition-all active:scale-90"
                    >
                        <ArrowLeft className="h-6 w-6" />
                    </Button>
                    <div className="h-10 w-px bg-border/20 hidden sm:block" />
                    <div className="hidden sm:block">
                        <h1 className="text-2xl font-black tracking-tighter uppercase leading-none text-foreground flex items-center gap-3">
                            Editorial Studio
                            <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                        </h1>
                        <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-muted-foreground mt-1">
                            Node: Archival Transmission Core
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <Button
                        variant="outline"
                        onClick={handlePublish}
                        disabled={isPublishing || !title.trim() || !body.trim()}
                        className="rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] px-10 h-12 bg-primary text-primary-foreground border-none hover:bg-primary/90 shadow-2xl shadow-primary/40 transition-all active:scale-95 disabled:opacity-30 disabled:grayscale"
                    >
                        {isPublishing ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-3" />
                        ) : (
                            <Send className="h-4 w-4 mr-3" />
                        )}
                        Commit Signal
                    </Button>
                </div>
            </div>

            <div className="flex-1 w-full max-w-4xl mx-auto px-6 py-16 space-y-20">
                {error && (
                    <Alert
                        variant="destructive"
                        className="rounded-3xl border-destructive/20 bg-destructive/5 animate-in fade-in slide-in-from-top-4 duration-500"
                    >
                        <AlertDescription className="text-xs font-bold uppercase tracking-widest text-center py-2">
                            {error}
                        </AlertDescription>
                    </Alert>
                )}

                {/* Editor Surface */}
                <div className="space-y-16 pb-40">
                    {/* Banner Hub */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-4 group bg-muted/20 p-4 rounded-3xl border border-border/5 focus-within:border-primary/20 transition-all">
                            <div className="h-10 w-10 rounded-2xl bg-background flex items-center justify-center border border-border/10 shadow-sm group-focus-within:shadow-primary/10 transition-all">
                                <Globe className="h-4 w-4 text-muted-foreground/30 group-focus-within:text-primary transition-colors" />
                            </div>
                            <Input
                                placeholder="Banner Frequency / Media Protocol URL"
                                value={banner}
                                onChange={(e) => setBanner(e.target.value)}
                                className="bg-transparent border-none shadow-none text-[11px] font-bold uppercase tracking-[0.2em] focus-visible:ring-0 placeholder:text-muted-foreground/10 p-0 h-auto w-full"
                            />
                        </div>

                        {banner && (
                            <div className="relative rounded-[2.5rem] overflow-hidden border border-border/10 aspect-21/9 bg-muted/5 group shadow-3xl animate-in zoom-in-95 duration-700">
                                <img
                                    src={banner}
                                    alt="banner preview"
                                    className="w-full h-full object-cover grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-1000 scale-100 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-linear-to-t from-background/80 via-transparent to-transparent opacity-60" />
                                <Button
                                    variant="destructive"
                                    size="icon"
                                    className="absolute top-6 right-6 rounded-2xl h-12 w-12 bg-background/40 backdrop-blur-3xl border border-border/10 hover:bg-rose-500 hover:text-white transition-all shadow-2xl active:scale-90"
                                    onClick={() => setBanner('')}
                                >
                                    <XCircle className="h-6 w-6" />
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Content Section */}
                    <div className="space-y-12">
                        <div className="space-y-4">
                            <Input
                                placeholder="TRANSMISSION TITLE..."
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="border-none shadow-none text-6xl md:text-8xl font-black p-0 h-auto focus-visible:ring-0 placeholder:text-muted-foreground/5 bg-transparent tracking-tighter uppercase leading-[0.8] transition-all"
                                maxLength={100}
                            />
                            <div className="flex items-center justify-between opacity-20">
                                <div className="h-px bg-linear-to-r from-primary/50 to-transparent flex-1" />
                                <span className="ml-4 text-[10px] font-black tracking-widest">
                                    {title.length}/100
                                </span>
                            </div>
                        </div>

                        <Textarea
                            placeholder="Initialize signal decryption into written format..."
                            value={body}
                            onChange={(e) => setBody(e.target.value)}
                            className="border-none shadow-none text-2xl md:text-3xl p-0 min-h-[700px] focus-visible:ring-0 resize-none bg-transparent leading-relaxed placeholder:text-muted-foreground/5 font-medium selection:bg-primary/20"
                        />
                    </div>
                </div>

                {/* Status Bar */}
                <div className="fixed bottom-10 left-1/2 -translate-x-1/2 w-full max-w-2xl px-6 z-50">
                    <div className="bg-card/30 backdrop-blur-3xl border border-border/10 rounded-[2rem] p-5 flex items-center justify-between shadow-2xl shadow-black/60 group hover:border-primary/20 transition-all duration-500">
                        <div className="flex items-center gap-8 px-4">
                            <div className="flex items-center gap-4">
                                <Switch
                                    checked={enableComments}
                                    onCheckedChange={setEnableComments}
                                    className="data-[state=checked]:bg-primary scale-110"
                                />
                                <div className="flex flex-col">
                                    <span className="text-[11px] font-black uppercase tracking-[0.2em] text-foreground">
                                        Commentary
                                    </span>
                                    <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-muted-foreground/40">
                                        Active Loop
                                    </span>
                                </div>
                            </div>

                            <div className="h-10 w-px bg-border/10" />

                            <div className="flex items-center gap-4 opacity-40 hover:opacity-100 transition-opacity cursor-help">
                                <Globe className="h-5 w-5 text-primary" />
                                <div className="flex flex-col">
                                    <span className="text-[11px] font-black uppercase tracking-[0.2em] text-foreground font-mono">
                                        Encryption
                                    </span>
                                    <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-muted-foreground/40">
                                        AES-256 Node
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="hidden sm:flex flex-col items-end px-6">
                            <span className="text-[9px] font-black uppercase tracking-[0.5em] text-primary leading-none">
                                Studio v2.5
                            </span>
                            <span className="text-[8px] font-bold uppercase tracking-[0.3em] text-muted-foreground/20 mt-1">
                                System Status: Operational
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

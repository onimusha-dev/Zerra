import React from 'react';
import { ArrowLeft, Bookmark, Share } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export function PostViewHeader() {
    const router = useRouter();

    return (
        <div className="sticky top-0 z-40 bg-yellow-500 bg-bckground/90 backdrop-blur-md px-4 py-12 md:px-12 mb-8 border-b border-border/20 flex items-center justify-between">
            <div className="flex items-center gap-6">
                <button
                    onClick={() => router.back()}
                    className="rounded-none h-11 w-11 border border-border/20 hover:border-primary transition-all bg-card/10 flex items-center justify-center group"
                >
                    <ArrowLeft className="h-5 w-5" />
                </button>
                <div>
                    <h1 className="text-2xl md:text-3xl font-black tracking-tighter uppercase leading-none text-foreground">
                        Transmission
                    </h1>
                    <p className="text-[10px] md:text-[11px] font-bold uppercase tracking-[0.4em] text-primary mt-2">
                        Single Feed View
                    </p>
                </div>
            </div>
            <div className="flex items-center gap-4">
                <Button
                    variant="outline"
                    size="icon"
                    className="rounded-none h-9 w-9 border-border/20 hover:border-primary/40 transition-colors"
                >
                    <Bookmark className="h-4 w-4" />
                </Button>
                <Button
                    variant="outline"
                    size="icon"
                    className="rounded-none h-9 w-9 border-border/20 hover:border-primary/40 transition-colors"
                >
                    <Share className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}

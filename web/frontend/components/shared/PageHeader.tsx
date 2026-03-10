'use client';

import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

interface PageHeaderProps {
    title: string;
    subtitle?: string;
    onBack?: () => void;
    actions?: React.ReactNode;
    sticky?: boolean;
}

export function PageHeader({ title, subtitle, onBack, actions, sticky = true }: PageHeaderProps) {
    const router = useRouter();
    const handleBack = onBack ?? (() => router.back());

    return (
        <div
            className={`${sticky ? 'sticky top-0 z-40' : ''} bg-background/85 backdrop-blur-xl px-4 py-5 flex items-center justify-between border-b border-border/8`}
        >
            <div className="flex gap-4 items-center">
                <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-2xl h-10 w-10 hover:bg-muted/50 transition-all active:scale-90 shrink-0"
                    onClick={handleBack}
                >
                    <ArrowLeft className="h-4.5 w-4.5" />
                </Button>
                <div>
                    <h1 className="text-xl font-black tracking-tight uppercase leading-none">
                        {title}
                    </h1>
                    {subtitle && (
                        <p className="text-[9px] font-bold uppercase tracking-[0.35em] text-primary/60 mt-1.5">
                            {subtitle}
                        </p>
                    )}
                </div>
            </div>
            {actions && <div className="flex items-center gap-3">{actions}</div>}
        </div>
    );
}

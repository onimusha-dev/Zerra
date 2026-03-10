'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, Loader2, Send } from 'lucide-react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { fetchApi } from '@/lib/api';

export default function ForgotPasswordPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitted, setIsSubmitted] = useState(false);

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsLoading(true);
        setError(null);

        const formData = new FormData(event.currentTarget);
        const email = formData.get('email') as string;

        try {
            const response = await fetchApi('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (data.success) {
                setIsSubmitted(true);
            } else {
                setError(data.message || 'Failed to send reset link.');
            }
        } catch (err) {
            setError('Synchronization failure.');
        } finally {
            setIsLoading(false);
        }
    }

    if (isSubmitted) {
        return (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 text-center">
                <div className="mx-auto h-16 w-16 bg-foreground rounded-sm flex items-center justify-center mb-6">
                    <CheckCircle2 className="h-8 w-8 text-background" />
                </div>
                <div className="space-y-2">
                    <h2 className="text-xl font-bold tracking-tight uppercase leading-none">
                        Signal Emitted
                    </h2>
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                        Recovery data sent to node
                    </p>
                </div>
                <Button
                    asChild
                    className="w-full h-12 rounded-sm font-black text-[10px] uppercase tracking-widest bg-foreground text-background"
                >
                    <Link href="/auth/reset-password">Enter Recovery Code</Link>
                </Button>
                <Link
                    href="/auth/login"
                    className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 hover:text-foreground transition-colors pt-4"
                >
                    Return to Access
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center space-y-2">
                <h2 className="text-xl font-bold tracking-tight uppercase leading-none">
                    Recover Access
                </h2>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    Initialize identity restoration
                </p>
            </div>

            <form onSubmit={onSubmit} className="space-y-6">
                {error && (
                    <Alert
                        variant="destructive"
                        className="rounded-sm border-destructive/20 bg-destructive/5"
                    >
                        <AlertDescription className="text-[10px] font-black uppercase tracking-widest text-center">
                            {error}
                        </AlertDescription>
                    </Alert>
                )}

                <div className="space-y-2">
                    <Label
                        htmlFor="email"
                        className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground px-1"
                    >
                        Email Node
                    </Label>
                    <Input
                        id="email"
                        name="email"
                        placeholder="Email"
                        type="email"
                        disabled={isLoading}
                        required
                        className="h-12 rounded-sm bg-muted/30 border-border/40 px-4 font-bold text-xs focus-visible:ring-0"
                    />
                </div>

                <Button
                    type="submit"
                    className="w-full h-12 rounded-sm font-black text-[10px] uppercase tracking-widest bg-foreground text-background hover:bg-foreground/90 transition-all"
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                            Transmitting...
                        </>
                    ) : (
                        <>
                            Send Restoration Signal
                            <Send className="ml-2 h-3 w-3" />
                        </>
                    )}
                </Button>

                <div className="text-center pt-2">
                    <Link
                        href="/auth/login"
                        className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 hover:text-foreground transition-colors"
                    >
                        Access Restored? Login
                    </Link>
                </div>
            </form>
        </div>
    );
}

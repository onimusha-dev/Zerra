'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle2, Loader2, Mail } from 'lucide-react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { fetchApi } from '@/lib/api';

function VerifyEmailInner() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const email = searchParams.get('email');
        const token = searchParams.get('token');
        const code = searchParams.get('code');

        if (email && token && code) {
            handleVerify(email, token, code);
        }
    }, [searchParams]);

    async function handleVerify(email: string, token: string, code: string) {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetchApi('/api/auth/verify-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, token, code }),
            });

            const data = await response.json();

            if (data.success) {
                setStatus('success');
            } else {
                setStatus('error');
                setError(data.message || 'Verification rejected.');
            }
        } catch (err) {
            setStatus('error');
            setError('Synchronization failure.');
        } finally {
            setIsLoading(false);
        }
    }

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const email = formData.get('email') as string;
        const code = formData.get('code') as string;
        const token = searchParams.get('token') || '';

        handleVerify(email, token, code);
    }

    if (status === 'success') {
        return (
            <div className="space-y-8 animate-in zoom-in duration-500 text-center">
                <div className="mx-auto h-16 w-16 bg-foreground rounded-sm flex items-center justify-center mb-6">
                    <CheckCircle2 className="h-8 w-8 text-background" />
                </div>
                <div className="space-y-2">
                    <h2 className="text-xl font-bold tracking-tight uppercase italic leading-none">
                        Identity Validated
                    </h2>
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                        Protocol access granted
                    </p>
                </div>
                <Button
                    asChild
                    className="w-full h-12 rounded-sm font-black text-[10px] uppercase tracking-widest bg-foreground text-background"
                >
                    <Link href="/auth/login">Enter Mainframe</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center space-y-2">
                <h2 className="text-xl font-bold tracking-tight uppercase italic leading-none">
                    Validate Identity
                </h2>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    Confirm your signal
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

                <div className="space-y-4">
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
                            defaultValue={searchParams.get('email') || ''}
                            placeholder="Email"
                            type="email"
                            disabled={isLoading}
                            required
                            className="h-12 rounded-sm bg-muted/30 border-border/40 px-4 font-bold text-xs focus-visible:ring-0 italic"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label
                            htmlFor="code"
                            className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground px-1"
                        >
                            Verification Code
                        </Label>
                        <Input
                            id="code"
                            name="code"
                            defaultValue={searchParams.get('code') || ''}
                            placeholder="000000"
                            disabled={isLoading}
                            required
                            className="h-12 rounded-sm bg-muted/30 border-border/40 px-4 font-black focus-visible:ring-0 text-center tracking-[0.5em]"
                        />
                    </div>
                </div>

                <Button
                    type="submit"
                    className="w-full h-12 rounded-sm font-black text-[10px] uppercase tracking-widest bg-foreground text-background hover:bg-foreground/90 transition-all"
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                            Verifying...
                        </>
                    ) : (
                        <>
                            Verify Node
                            <Mail className="ml-2 h-3 w-3" />
                        </>
                    )}
                </Button>

                <div className="text-center pt-2">
                    <p className="text-[8px] font-black uppercase tracking-[0.5em] text-muted-foreground/20 italic">
                        A waiting signal reception...
                    </p>
                </div>
            </form>
        </div>
    );
}

export default function VerifyEmailPage() {
    return (
        <Suspense
            fallback={
                <div className="text-[10px] font-black uppercase tracking-[0.5em] text-center opacity-20">
                    Initializing...
                </div>
            }
        >
            <VerifyEmailInner />
        </Suspense>
    );
}

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Loader2 } from 'lucide-react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { fetchApi } from '@/lib/api';

export default function LoginPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsLoading(true);
        setError(null);

        const formData = new FormData(event.currentTarget);
        const identifier = formData.get('identifier') as string;
        const password = formData.get('password') as string;

        const isEmail = identifier.includes('@');
        const payload: any = { password };

        if (isEmail) {
            payload.email = identifier;
        } else {
            payload.username = identifier;
        }

        try {
            const response = await fetchApi('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (data.success) {
                router.push('/');
            } else {
                setError(data.message || 'Invalid credentials.');
            }
        } catch (err) {
            setError('Synchronization failure.');
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center space-y-2">
                <h2 className="text-xl font-bold tracking-tight uppercase italic leading-none">
                    Access Node
                </h2>
                <p className="text-[10px] font-bold uppercase tracking-widest text-primary/40">
                    Synchronize your credentials
                </p>
            </div>

            <form onSubmit={onSubmit} className="space-y-6">
                {error && (
                    <Alert
                        variant="destructive"
                        className="rounded-none border-destructive/20 bg-destructive/5 text-rose-500"
                    >
                        <AlertDescription className="text-[10px] font-bold uppercase tracking-widest leading-normal">
                            {error}
                        </AlertDescription>
                    </Alert>
                )}

                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label
                            htmlFor="identifier"
                            className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40 px-1"
                        >
                            Cleartext Ident
                        </Label>
                        <Input
                            id="identifier"
                            name="identifier"
                            placeholder="Email or Username"
                            type="text"
                            autoCapitalize="none"
                            autoComplete="username"
                            required
                            disabled={isLoading}
                            className="h-12 rounded-none bg-muted/10 border-border/10 px-4 font-bold tracking-tight focus-visible:ring-1 focus-visible:ring-primary/20 placeholder:text-muted-foreground/20 italic transition-all"
                        />
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between px-1">
                            <Label
                                htmlFor="password"
                                className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40"
                            >
                                Cipher Key
                            </Label>
                            <Link
                                href="/auth/forgot-password"
                                className="text-[10px] font-bold uppercase tracking-widest text-primary/40 hover:text-primary transition-colors italic"
                            >
                                Lost Access?
                            </Link>
                        </div>
                        <Input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete="current-password"
                            required
                            disabled={isLoading}
                            className="h-12 rounded-none bg-muted/10 border-border/10 px-4 font-bold focus-visible:ring-1 focus-visible:ring-primary/20 transition-all text-primary"
                        />
                    </div>
                </div>

                <Button type="submit" className="btn-primary w-full h-12" disabled={isLoading}>
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                            Syncing...
                        </>
                    ) : (
                        <>
                            Engage Auth
                            <ArrowRight className="ml-2 h-3 w-3" />
                        </>
                    )}
                </Button>

                <div className="text-center pt-2">
                    <Link
                        href="/auth/register"
                        className="text-[10px] font-bold uppercase tracking-widest text-primary/40 hover:text-primary transition-colors italic"
                    >
                        Request New Node Initial
                    </Link>
                </div>
            </form>
        </div>
    );
}

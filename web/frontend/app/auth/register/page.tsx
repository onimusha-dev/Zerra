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

export default function RegisterPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsLoading(true);
        setError(null);

        const formData = new FormData(event.currentTarget);
        const name = formData.get('name') as string;
        const username = formData.get('username') as string;
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;
        const confirmPassword = formData.get('confirmPassword') as string;

        if (password !== confirmPassword) {
            setError('Cipher mismatch.');
            setIsLoading(false);
            return;
        }

        try {
            const payload: any = {
                name,
                username,
                email,
                password,
                confirmPassword,
                timezone: 'UTC',
            };

            const response = await fetchApi('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (data.success) {
                router.push('/');
            } else {
                setError(data.message || 'Archive rejection.');
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
                    Node Initial
                </h2>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    Request protocol entry
                </p>
            </div>

            <form onSubmit={onSubmit} className="space-y-6">
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

                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label
                                htmlFor="name"
                                className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground px-1"
                            >
                                Full Identity
                            </Label>
                            <Input
                                id="name"
                                name="name"
                                placeholder="Name"
                                disabled={isLoading}
                                required
                                className="h-10 rounded-sm bg-muted/30 border-border/40 px-3 font-bold text-xs focus-visible:ring-0 italic"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label
                                htmlFor="username"
                                className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground px-1"
                            >
                                Handle
                            </Label>
                            <Input
                                id="username"
                                name="username"
                                placeholder="Handle"
                                disabled={isLoading}
                                required
                                className="h-10 rounded-sm bg-muted/30 border-border/40 px-3 font-bold text-xs focus-visible:ring-0 italic"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label
                            htmlFor="email"
                            className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground px-1"
                        >
                            Email Identifier
                        </Label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="Email"
                            disabled={isLoading}
                            required
                            className="h-10 rounded-sm bg-muted/30 border-border/40 px-3 font-bold text-xs focus-visible:ring-0 italic"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label
                                htmlFor="password"
                                className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground px-1"
                            >
                                Cipher
                            </Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                disabled={isLoading}
                                required
                                className="h-10 rounded-sm bg-muted/30 border-border/40 px-3 font-bold focus-visible:ring-0"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label
                                htmlFor="confirmPassword"
                                className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground px-1"
                            >
                                Repeat
                            </Label>
                            <Input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                disabled={isLoading}
                                required
                                className="h-10 rounded-sm bg-muted/30 border-border/40 px-3 font-bold focus-visible:ring-0"
                            />
                        </div>
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
                            Allocating...
                        </>
                    ) : (
                        <>
                            Request Admission
                            <ArrowRight className="ml-2 h-3 w-3" />
                        </>
                    )}
                </Button>

                <div className="text-center pt-2">
                    <Link
                        href="/auth/login"
                        className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 hover:text-foreground transition-colors"
                    >
                        Existing Persona Detected? Login
                    </Link>
                </div>
            </form>
        </div>
    );
}

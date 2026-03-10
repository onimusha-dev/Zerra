'use client';

import React, { Suspense, useState } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { KeySquare, Loader2, Send } from 'lucide-react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { fetchApi } from '@/lib/api';

function ResetPasswordInner() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsLoading(true);
        setError(null);

        const formData = new FormData(event.currentTarget);
        const otp = formData.get('otp') as string;
        const password = formData.get('password') as string;
        const confirmPassword = formData.get('confirmPassword') as string;
        const uuid = searchParams.get('uuid') || '';

        if (password !== confirmPassword) {
            setError('Cipher mismatch.');
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetchApi('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ uuid, otp, password, confirmPassword }),
            });

            const data = await response.json();

            if (data.success) {
                router.push('/auth/login?reset=success');
            } else {
                setError(data.message || 'Invalid code or rejection.');
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
                <h2 className="text-xl font-bold tracking-tight uppercase leading-none">
                    Re-key Node
                </h2>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    Establish new access cipher
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
                            htmlFor="otp"
                            className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground px-1"
                        >
                            Recovery Token
                        </Label>
                        <Input
                            id="otp"
                            name="otp"
                            placeholder="000000"
                            disabled={isLoading}
                            required
                            className="h-12 rounded-sm bg-muted/30 border-border/40 px-4 font-black focus-visible:ring-0 text-center tracking-[0.5em]"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label
                                htmlFor="password"
                                className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground px-1"
                            >
                                New Cipher
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
                            Updating...
                        </>
                    ) : (
                        <>
                            Update Node Key
                            <KeySquare className="ml-2 h-3 w-3" />
                        </>
                    )}
                </Button>

                <div className="text-center pt-2">
                    <Link
                        href="/auth/login"
                        className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 hover:text-foreground transition-colors"
                    >
                        Abort? Back to Access
                    </Link>
                </div>
            </form>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense
            fallback={
                <div className="text-[10px] font-black uppercase tracking-[0.5em] text-center opacity-20">
                    Initializing...
                </div>
            }
        >
            <ResetPasswordInner />
        </Suspense>
    );
}

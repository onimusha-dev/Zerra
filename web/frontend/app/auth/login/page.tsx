'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuthMutations } from '@/hooks/mutations/useAuth';
import { useAuthStore } from '@/stores/useAuthStore';
import { useRouter } from 'next/navigation';
import { Loader2, Mail, Lock, AlertCircle } from 'lucide-react';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { loginMutation } = useAuthMutations();
    const { isAuthenticated, user } = useAuthStore();
    const router = useRouter();

    useEffect(() => {
        console.log('[LoginPage] Auth State:', { isAuthenticated, username: user?.username });
        if (isAuthenticated && user) {
            console.log('[LoginPage] Authenticated, redirecting to profile:', user.username);
            router.push(`/profile/${user.username}`);
            router.refresh();
        }
    }, [isAuthenticated, user, router]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        loginMutation.mutate({ email, password });
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-background px-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md space-y-8 rounded-3xl border bg-secondary-ui/20 p-8 backdrop-blur-xl"
            >
                <div className="text-center">
                    <div className="mx-auto h-12 w-12 rounded-2xl bg-primary-ui flex items-center justify-center mb-4">
                        <span className="font-bold text-background text-2xl italic">Z</span>
                    </div>
                    <h2 className="text-3xl font-bold tracking-tight">Welcome back</h2>
                    <p className="mt-2 text-sm text-secondary-foreground opacity-60">
                        Login to your Zerra account to continue
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                    <div className="space-y-4">
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 opacity-40" />
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Email address"
                                className="w-full rounded-2xl border bg-background py-4 pl-12 pr-4 outline-none focus:ring-2 focus:ring-primary-ui/20 transition-all"
                            />
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 opacity-40" />
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Password"
                                className="w-full rounded-2xl border bg-background py-4 pl-12 pr-4 outline-none focus:ring-2 focus:ring-primary-ui/20 transition-all"
                            />
                        </div>
                    </div>

                    {loginMutation.isError && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center gap-2 rounded-xl bg-destructive/10 p-4 text-sm text-destructive"
                        >
                            <AlertCircle className="h-4 w-4" />
                            <span>
                                {(loginMutation.error as any)?.response?.data?.message ||
                                    loginMutation.error?.message ||
                                    'Invalid email or password'}
                            </span>
                        </motion.div>
                    )}

                    <button
                        type="submit"
                        disabled={loginMutation.isPending}
                        className="group relative flex w-full justify-center rounded-2xl bg-primary-ui py-4 text-sm font-bold text-background transition-all hover:opacity-90 disabled:opacity-50"
                    >
                        {loginMutation.isPending ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                            'Sign in'
                        )}
                    </button>
                </form>

                <p className="text-center text-sm text-secondary-foreground opacity-60">
                    Don&apos;t have an account?{' '}
                    <Link
                        href="/auth/register"
                        className="font-bold text-primary-ui hover:underline"
                    >
                        Create one
                    </Link>
                </p>
            </motion.div>
        </div>
    );
}

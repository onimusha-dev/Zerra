'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuthMutations } from '@/hooks/mutations/useAuth';
import { Loader2, Mail, AlertCircle, ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const { forgotPasswordMutation } = useAuthMutations();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        forgotPasswordMutation.mutate({ email });
    };

    if (forgotPasswordMutation.isSuccess) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background px-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-md space-y-8 rounded-3xl border bg-secondary-ui/20 p-8 backdrop-blur-xl text-center"
                >
                    <div className="mx-auto h-16 w-16 rounded-full bg-primary-ui/10 flex items-center justify-center mb-6">
                        <CheckCircle2 className="h-10 w-10 text-primary-ui" />
                    </div>
                    <h2 className="text-3xl font-bold">Check your email</h2>
                    <p className="mt-2 text-sm text-secondary-foreground opacity-60">
                        We have sent a password reset link to{' '}
                        <span className="font-semibold text-foreground">{email}</span>
                    </p>
                    <Link
                        href="/auth/login"
                        className="mt-8 flex items-center justify-center gap-2 font-bold text-primary-ui hover:underline"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to login
                    </Link>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-background px-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md space-y-8 rounded-3xl border bg-secondary-ui/20 p-8 backdrop-blur-xl"
            >
                <div className="text-center">
                    <Link
                        href="/auth/login"
                        className="inline-flex items-center gap-2 text-sm text-secondary-foreground opacity-60 hover:opacity-100 transition-opacity mb-8"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to login
                    </Link>
                    <div className="mx-auto h-12 w-12 rounded-2xl bg-primary-ui flex items-center justify-center mb-4">
                        <span className="font-bold text-background text-2xl italic">Z</span>
                    </div>
                    <h2 className="text-3xl font-bold tracking-tight">Forgot password?</h2>
                    <p className="mt-2 text-sm text-secondary-foreground opacity-60">
                        No worries, we&apos;ll send you reset instructions.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                    <div className="relative">
                        <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 opacity-40" />
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            className="w-full rounded-2xl border bg-background py-4 pl-12 pr-4 outline-none focus:ring-2 focus:ring-primary-ui/20 transition-all"
                        />
                    </div>

                    {forgotPasswordMutation.isError && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center gap-2 rounded-xl bg-destructive/10 p-4 text-sm text-destructive"
                        >
                            <AlertCircle className="h-4 w-4" />
                            <span>
                                {(forgotPasswordMutation.error as any)?.response?.data?.message ||
                                    forgotPasswordMutation.error?.message ||
                                    'Something went wrong. Please try again.'}
                            </span>
                        </motion.div>
                    )}

                    <button
                        type="submit"
                        disabled={forgotPasswordMutation.isPending}
                        className="group relative flex w-full justify-center rounded-2xl bg-primary-ui py-4 text-sm font-bold text-background transition-all hover:opacity-90 disabled:opacity-50"
                    >
                        {forgotPasswordMutation.isPending ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                            'Reset password'
                        )}
                    </button>
                </form>
            </motion.div>
        </div>
    );
}

'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuthMutations } from '@/hooks/mutations/useAuth';
import { Loader2, Mail, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';

function VerifyEmailContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const email = searchParams.get('email');
    const token = searchParams.get('token');
    const code = searchParams.get('code');

    const { verifyEmailMutation } = useAuthMutations();
    const [isVerifying, setIsVerifying] = useState(false);

    useEffect(() => {
        if (
            email &&
            (token || code) &&
            !verifyEmailMutation.isSuccess &&
            !verifyEmailMutation.isError &&
            !isVerifying
        ) {
            setIsVerifying(true);
            verifyEmailMutation.mutate({
                email,
                token: token || undefined,
                code: code || undefined,
            });
        }
    }, [email, token, code, verifyEmailMutation, isVerifying]);

    if (verifyEmailMutation.isSuccess) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md space-y-8 rounded-3xl border bg-secondary-ui/20 p-8 backdrop-blur-xl text-center"
            >
                <div className="mx-auto h-16 w-16 rounded-full bg-primary-ui/10 flex items-center justify-center mb-6">
                    <CheckCircle2 className="h-10 w-10 text-primary-ui" />
                </div>
                <h2 className="text-3xl font-bold">Email Verified!</h2>
                <p className="mt-2 text-sm text-secondary-foreground opacity-60">
                    Your email has been successfully verified. You can now use all the features of
                    Zerra.
                </p>
                <button
                    onClick={() => router.push('/auth/login')}
                    className="mt-8 flex w-full justify-center items-center gap-2 rounded-2xl bg-primary-ui py-4 text-sm font-bold text-background transition-all hover:opacity-90"
                >
                    Go to login
                    <ArrowRight className="h-4 w-4" />
                </button>
            </motion.div>
        );
    }

    if (verifyEmailMutation.isError) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md space-y-8 rounded-3xl border bg-secondary-ui/20 p-8 backdrop-blur-xl text-center"
            >
                <div className="mx-auto h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center mb-6">
                    <AlertCircle className="h-10 w-10 text-destructive" />
                </div>
                <h2 className="text-3xl font-bold">Verification Failed</h2>
                <p className="mt-2 text-sm text-secondary-foreground opacity-60">
                    {(verifyEmailMutation.error as any)?.response?.data?.message ||
                        'The verification link is invalid or has expired.'}
                </p>
                <button
                    onClick={() => router.push('/auth/login')}
                    className="mt-8 flex w-full justify-center rounded-2xl border py-4 text-sm font-bold hover:bg-secondary-ui/50 transition-all"
                >
                    Back to login
                </button>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md space-y-8 rounded-3xl border bg-secondary-ui/20 p-8 backdrop-blur-xl text-center"
        >
            <div className="mx-auto h-12 w-12 rounded-2xl bg-primary-ui flex items-center justify-center mb-4">
                <span className="font-bold text-background text-2xl italic">Z</span>
            </div>
            <h2 className="text-3xl font-bold tracking-tight">Verifying Email</h2>
            <p className="mt-2 text-sm text-secondary-foreground opacity-60">
                Please wait while we verify your email address...
            </p>
            <div className="flex justify-center mt-8">
                <Loader2 className="h-12 w-12 animate-spin text-primary-ui opacity-50" />
            </div>
        </motion.div>
    );
}

export default function VerifyEmailPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-background px-4">
            <Suspense
                fallback={
                    <div className="flex flex-col items-center gap-4">
                        <Loader2 className="h-12 w-12 animate-spin text-primary-ui opacity-50" />
                        <p className="text-sm opacity-60">Loading...</p>
                    </div>
                }
            >
                <VerifyEmailContent />
            </Suspense>
        </div>
    );
}

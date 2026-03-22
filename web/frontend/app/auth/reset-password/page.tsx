'use client';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuthMutations } from '@/hooks/mutations/useAuth';
import { Loader2, Lock, AlertCircle, Eye, EyeOff, CheckCircle2 } from 'lucide-react';

function ResetPasswordContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const uuid = searchParams.get('uuid');
    const otp = searchParams.get('otp') || searchParams.get('token');

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const { resetPasswordMutation } = useAuthMutations();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) return;
        if (uuid && otp) {
            resetPasswordMutation.mutate({ uuid, otp, password });
        }
    };

    if (resetPasswordMutation.isSuccess) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background px-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-md space-y-8 rounded-3xl border bg-secondary-ui/20 p-8 backdrop-blur-xl text-center"
                >
                    <CheckCircle2 className="mx-auto h-10 w-10 text-primary-ui" />
                    <h2 className="text-3xl font-bold">Password Reset</h2>
                    <button
                        onClick={() => router.push('/auth/login')}
                        className="mt-6 w-full rounded-2xl bg-primary-ui py-4 text-background"
                    >
                        Go to login
                    </button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-background px-4">
            <motion.div className="w-full max-w-md space-y-8 rounded-3xl border p-8">
                {!uuid || !otp ? (
                    <div className="text-center">
                        <AlertCircle className="mx-auto h-12 w-12 text-destructive opacity-50" />
                        <p>Invalid or missing reset token</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="New Password"
                            className="w-full border p-4 rounded-2xl"
                        />
                        <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm Password"
                            className="w-full border p-4 rounded-2xl"
                        />
                        <button className="w-full bg-primary-ui text-background py-4 rounded-2xl">
                            {resetPasswordMutation.isPending ? 'Loading...' : 'Reset password'}
                        </button>
                    </form>
                )}
            </motion.div>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<div className="p-10 text-center">Loading...</div>}>
            <ResetPasswordContent />
        </Suspense>
    );
}

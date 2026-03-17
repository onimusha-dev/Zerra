'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuthMutations } from '@/hooks/mutations/useAuth';
import { useAuthStore } from '@/stores/useAuthStore';
import { useRouter } from 'next/navigation';
import { Loader2, Mail, Lock, User, AtSign, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        name: '',
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
    });

    const { registerMutation } = useAuthMutations();
    const { isAuthenticated, user } = useAuthStore();
    const router = useRouter();

    useEffect(() => {
        if (isAuthenticated && user) {
            router.push(`/profile/${user.username}`);
            router.refresh();
        }
    }, [isAuthenticated, user, router]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        registerMutation.mutate(formData);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md space-y-8 rounded-3xl border bg-secondary-ui/20 p-8 backdrop-blur-xl"
            >
                <div className="text-center">
                    <div className="mx-auto h-12 w-12 rounded-2xl bg-primary-ui flex items-center justify-center mb-4">
                        <span className="font-bold text-background text-2xl italic">Z</span>
                    </div>
                    <h2 className="text-3xl font-bold tracking-tight">Create account</h2>
                    <p className="mt-2 text-sm text-secondary-foreground opacity-60">
                        Join the Zerra community today
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="mt-8 space-y-4">
                    <div className="relative">
                        <User className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 opacity-40" />
                        <input
                            name="name"
                            type="text"
                            required
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Full Name"
                            className="w-full rounded-2xl border bg-background py-4 pl-12 pr-4 outline-none focus:ring-2 focus:ring-primary-ui/20 transition-all"
                        />
                    </div>

                    <div className="relative">
                        <AtSign className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 opacity-40" />
                        <input
                            name="username"
                            type="text"
                            required
                            value={formData.username}
                            onChange={handleChange}
                            placeholder="Username"
                            className="w-full rounded-2xl border bg-background py-4 pl-12 pr-4 outline-none focus:ring-2 focus:ring-primary-ui/20 transition-all"
                        />
                    </div>

                    <div className="relative">
                        <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 opacity-40" />
                        <input
                            name="email"
                            type="email"
                            required
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Email address"
                            className="w-full rounded-2xl border bg-background py-4 pl-12 pr-4 outline-none focus:ring-2 focus:ring-primary-ui/20 transition-all"
                        />
                    </div>

                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 opacity-40" />
                        <input
                            name="password"
                            type="password"
                            required
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Password"
                            className="w-full rounded-2xl border bg-background py-4 pl-12 pr-4 outline-none focus:ring-2 focus:ring-primary-ui/20 transition-all"
                        />
                    </div>

                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 opacity-40" />
                        <input
                            name="confirmPassword"
                            type="password"
                            required
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder="Confirm Password"
                            className="w-full rounded-2xl border bg-background py-4 pl-12 pr-4 outline-none focus:ring-2 focus:ring-primary-ui/20 transition-all"
                        />
                    </div>

                    {registerMutation.isError && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center gap-2 rounded-xl bg-destructive/10 p-4 text-sm text-destructive"
                        >
                            <AlertCircle className="h-4 w-4" />
                            <span>
                                {(registerMutation.error as any)?.response?.data?.message ||
                                    registerMutation.error?.message ||
                                    'Could not create account. Please check your details.'}
                            </span>
                        </motion.div>
                    )}

                    <button
                        type="submit"
                        disabled={registerMutation.isPending}
                        className="group relative flex w-full justify-center rounded-2xl bg-primary-ui py-4 text-sm font-bold text-background transition-all hover:opacity-90 disabled:opacity-50"
                    >
                        {registerMutation.isPending ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                            'Sign up'
                        )}
                    </button>
                </form>

                <p className="text-center text-sm text-secondary-foreground opacity-60">
                    Already have an account?{' '}
                    <Link href="/auth/login" className="font-bold text-primary-ui hover:underline">
                        Login
                    </Link>
                </p>
            </motion.div>
        </div>
    );
}

'use client';

import React, { useState } from 'react';
import MainLayout from '@/components/layout/main-layout';
import { ArrowLeft, Loader2, User as UserIcon, Mail } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/useAuthStore';
import api from '@/lib/api';

export default function AccountSettingsPage() {
    const router = useRouter();
    const { user, setUser } = useAuthStore();

    const [email, setEmail] = useState(user?.email || '');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setError(null);
        setSuccess(null);

        setLoading(true);
        try {
            const res = await api.patch('/users/me/change-email', {
                email,
                password,
            });
            setSuccess('Your email address has been successfully updated.');
            if (res.data?.data) {
                // Assume API returns updated user object in data
                setUser({ ...user, ...res.data.data });
            } else {
                // Fallback eager update
                setUser({ ...user, email });
            }
            setPassword('');
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'Failed to update email');
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;

    return (
        <MainLayout>
            <div className="flex h-14 items-center gap-6 border-b px-4 sticky top-0 bg-background/80 backdrop-blur-md z-10">
                <button
                    onClick={() => router.back()}
                    className="rounded-full p-2 transition-colors hover:bg-secondary-ui text-foreground"
                >
                    <ArrowLeft className="h-5 w-5" />
                </button>
                <h2 className="text-xl font-bold">Account information</h2>
            </div>

            <div className="flex flex-col p-6 max-w-xl mx-auto w-full">
                <div className="flex items-center gap-3 mb-6">
                    <div className="h-12 w-12 rounded-full bg-primary-ui/10 flex items-center justify-center">
                        <UserIcon className="h-6 w-6 text-primary-ui" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg">Your Details</h3>
                        <p className="text-secondary-foreground opacity-60 text-sm">
                            Review your non-public identifiers and update email.
                        </p>
                    </div>
                </div>

                {error && (
                    <div className="mb-4 rounded-xl bg-destructive/10 p-4 text-sm font-medium text-destructive border border-destructive/20">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="mb-4 rounded-xl bg-green-500/10 p-4 text-sm font-medium text-green-500 border border-green-500/20">
                        {success}
                    </div>
                )}

                {/* Read-only Information */}
                <div className="flex flex-col gap-6 mb-8">
                    <div className="flex flex-col">
                        <span className="text-xs font-bold uppercase tracking-wider text-secondary-foreground opacity-60 ml-1">
                            Username
                        </span>
                        <div className="px-4 py-3 bg-secondary-ui/20 rounded-xl mt-1 font-mono text-sm border border-border-ui">
                            @{user.username}
                        </div>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs font-bold uppercase tracking-wider text-secondary-foreground opacity-60 ml-1">
                            Account Creation
                        </span>
                        <div className="px-4 py-3 bg-secondary-ui/20 rounded-xl mt-1 text-sm border border-border-ui">
                            {user.createdAt
                                ? new Date(user.createdAt).toLocaleDateString(undefined, {
                                      year: 'numeric',
                                      month: 'long',
                                      day: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit',
                                  })
                                : 'Unknown'}
                        </div>
                    </div>
                </div>

                <div className="border-t border-border-ui my-4 opacity-50" />

                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <Mail className="h-5 w-5 text-primary-ui" /> Update Email Address
                </h3>

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    <div className="flex flex-col gap-1.5 focus-within:text-primary-ui transition-colors text-secondary-foreground">
                        <label className="text-sm font-bold opacity-80 pl-1 uppercase tracking-wider text-[11px]">
                            New Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="rounded-xl border border-secondary-ui bg-transparent p-4 outline-none transition-all focus:border-primary-ui focus:ring-1 focus:ring-primary-ui text-foreground placeholder:opacity-50"
                            placeholder="Enter new email address"
                            required
                        />
                    </div>

                    <div className="flex flex-col gap-1.5 focus-within:text-primary-ui transition-colors text-secondary-foreground mt-2">
                        <label className="text-sm font-bold opacity-80 pl-1 uppercase tracking-wider text-[11px]">
                            Confirm with Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="rounded-xl border border-secondary-ui bg-transparent p-4 outline-none transition-all focus:border-primary-ui focus:ring-1 focus:ring-primary-ui text-foreground placeholder:opacity-50"
                            placeholder="Enter your current password"
                            required
                        />
                        <span className="text-xs opacity-60 pl-1">
                            Required to apply security changes
                        </span>
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !email || !password || email === user.email}
                        className="mt-4 flex w-full items-center justify-center rounded-full bg-foreground p-4 font-bold text-background transition-colors hover:opacity-90 disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Verify & Save'}
                    </button>
                </form>
            </div>
        </MainLayout>
    );
}

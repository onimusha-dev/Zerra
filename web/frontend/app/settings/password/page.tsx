'use client';

import React, { useState } from 'react';
import MainLayout from '@/components/layout/main-layout';
import { ArrowLeft, Loader2, KeyRound, Eye, EyeOff } from 'lucide-react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

export default function PasswordSettingsPage() {
    const router = useRouter();
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        if (newPassword !== confirmPassword) {
            setError('New passwords do not match');
            return;
        }

        if (newPassword.length < 8) {
            setError('New password must be at least 8 characters');
            return;
        }

        setLoading(true);
        try {
            await api.patch('/users/me/change-password', {
                oldPassword,
                newPassword,
            });
            setSuccess('Your password has been successfully changed.');
            setOldPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'Failed to update password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <MainLayout>
            <div className="flex h-14 items-center gap-6 border-b px-4 sticky top-0 bg-background/80 backdrop-blur-md z-10">
                <button
                    onClick={() => router.back()}
                    className="rounded-full p-2 transition-colors hover:bg-secondary-ui text-foreground"
                >
                    <ArrowLeft className="h-5 w-5" />
                </button>
                <h2 className="text-xl font-bold">Change your password</h2>
            </div>

            <div className="flex flex-col p-6 max-w-xl mx-auto w-full">
                <div className="flex items-center gap-3 mb-6">
                    <div className="h-12 w-12 rounded-full bg-primary-ui/10 flex items-center justify-center">
                        <KeyRound className="h-6 w-6 text-primary-ui" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg">Update Password</h3>
                        <p className="text-secondary-foreground opacity-60 text-sm">
                            Choose a strong, unique password to keep your account safe.
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

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    <div className="flex flex-col gap-1.5 focus-within:text-primary-ui transition-colors text-secondary-foreground">
                        <label className="text-sm font-bold opacity-80 pl-1 uppercase tracking-wider text-[11px]">
                            Current password
                        </label>
                        <div className="relative">
                            <input
                                type={showOldPassword ? 'text' : 'password'}
                                value={oldPassword}
                                onChange={(e) => setOldPassword(e.target.value)}
                                className="w-full rounded-xl border border-secondary-ui bg-transparent p-4 pr-12 outline-none transition-all focus:border-primary-ui focus:ring-1 focus:ring-primary-ui text-foreground placeholder:opacity-50"
                                placeholder="Enter current password"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowOldPassword(!showOldPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 opacity-40 hover:opacity-100 transition-opacity"
                            >
                                {showOldPassword ? (
                                    <EyeOff className="h-5 w-5" />
                                ) : (
                                    <Eye className="h-5 w-5" />
                                )}
                            </button>
                        </div>
                        <span className="text-xs opacity-60 pl-1">
                            Required to verify your identity
                        </span>
                    </div>

                    <div className="border-t border-secondary-ui my-2 opacity-30 px-4" />

                    <div className="flex flex-col gap-1.5 focus-within:text-primary-ui transition-colors text-secondary-foreground">
                        <label className="text-sm font-bold opacity-80 pl-1 uppercase tracking-wider text-[11px]">
                            New password
                        </label>
                        <div className="relative">
                            <input
                                type={showNewPassword ? 'text' : 'password'}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full rounded-xl border border-secondary-ui bg-transparent p-4 pr-12 outline-none transition-all focus:border-primary-ui focus:ring-1 focus:ring-primary-ui text-foreground placeholder:opacity-50"
                                placeholder="Enter new password"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 opacity-40 hover:opacity-100 transition-opacity"
                            >
                                {showNewPassword ? (
                                    <EyeOff className="h-5 w-5" />
                                ) : (
                                    <Eye className="h-5 w-5" />
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-col gap-1.5 focus-within:text-primary-ui transition-colors text-secondary-foreground">
                        <label className="text-sm font-bold opacity-80 pl-1 uppercase tracking-wider text-[11px]">
                            Confirm password
                        </label>
                        <div className="relative">
                            <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full rounded-xl border border-secondary-ui bg-transparent p-4 pr-12 outline-none transition-all focus:border-primary-ui focus:ring-1 focus:ring-primary-ui text-foreground placeholder:opacity-50"
                                placeholder="Confirm new password"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 opacity-40 hover:opacity-100 transition-opacity"
                            >
                                {showConfirmPassword ? (
                                    <EyeOff className="h-5 w-5" />
                                ) : (
                                    <Eye className="h-5 w-5" />
                                )}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !oldPassword || !newPassword || !confirmPassword}
                        className="mt-6 flex w-full items-center justify-center rounded-full bg-foreground p-4 font-bold text-background transition-colors hover:opacity-90 disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Save'}
                    </button>
                </form>
            </div>
        </MainLayout>
    );
}

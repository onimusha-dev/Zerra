'use client';

import React from 'react';
import { ArrowLeft, Check, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useEditProfile } from '@/hooks/useEditProfile';
import { ProfileForm } from '@/components/profile/edit/ProfileForm';
import { SecurityProtocols } from '@/components/profile/edit/SecurityProtocols';

export default function EditProfilePage() {
    const router = useRouter();
    const { profile, isLoading, isSaving, error, success, updateProfile } = useEditProfile();

    if (isLoading)
        return (
            <div className="flex flex-col items-center justify-center p-20 gap-4 opacity-30">
                <Loader2 className="h-8 w-8 animate-spin text-foreground" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] leading-none">
                    Accessing Identity
                </span>
            </div>
        );

    if (!profile)
        return (
            <div className="p-24 text-center opacity-20">
                <p className="text-[10px] font-bold uppercase tracking-widest">
                    Persona node not found.
                </p>
            </div>
        );

    return (
        <div className="flex flex-col min-h-screen">
            {/* Header */}
            <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md px-2 py-8 mb-10 flex items-center justify-between border-b border-border/40 text-foreground">
                <div className="flex items-center gap-4">
                    <Button
                        variant="outline"
                        size="icon"
                        className="rounded-sm h-9 w-9 border-border/60"
                        onClick={() => router.back()}
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tighter uppercase leading-none">
                            Identity
                        </h1>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground mt-1">
                            Persona Configuration
                        </p>
                    </div>
                </div>
                <Button
                    form="profile-form"
                    type="submit"
                    disabled={isSaving}
                    className="rounded-sm font-black text-[10px] uppercase tracking-widest px-8 h-10 bg-foreground text-background"
                >
                    {isSaving ? (
                        <Loader2 className="h-3 w-3 animate-spin mr-2" />
                    ) : (
                        <Check className="h-3 w-3 mr-2" />
                    )}
                    Commit
                </Button>
            </div>

            <div className="w-full pb-32 px-2">
                <ProfileForm
                    profile={profile}
                    error={error}
                    success={success}
                    onSubmit={updateProfile}
                />

                <SecurityProtocols twoFactorEnabled={profile.twoFactorEnabled} />
            </div>
        </div>
    );
}

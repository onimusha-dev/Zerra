'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Camera, Loader2, AlertCircle } from 'lucide-react';
import { useAuthStore } from '@/stores/useAuthStore';
import { Profile } from '@/types/user';
import { getMediaUrl, cn } from '@/lib/utils';
import { useUpdateProfile } from '@/hooks/queries/useProfile';
import CropModal from '@/components/ui/crop-modal';

interface EditProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    profile: Profile;
}

export default function EditProfileModal({ isOpen, onClose, profile }: EditProfileModalProps) {
    const [name, setName] = useState(profile.name || '');
    const [bio, setBio] = useState(profile.bio || '');
    const [link, setLink] = useState(profile.link || '');

    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [bannerPreview, setBannerPreview] = useState<string | null>(null);

    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [bannerFile, setBannerFile] = useState<File | null>(null);

    const avatarInputRef = useRef<HTMLInputElement>(null);
    const bannerInputRef = useRef<HTMLInputElement>(null);

    const { mutateAsync: updateProfile, isPending } = useUpdateProfile();
    const [error, setError] = useState<string | null>(null);
    const { user, setUser } = useAuthStore();

    const [cropTarget, setCropTarget] = useState<'avatar' | 'banner' | null>(null);
    const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setCropImageSrc(URL.createObjectURL(file));
            setCropTarget('avatar');
        }
    };

    const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setCropImageSrc(URL.createObjectURL(file));
            setCropTarget('banner');
        }
    };

    const handleCropComplete = (croppedFile: File) => {
        if (cropTarget === 'avatar') {
            setAvatarFile(croppedFile);
            setAvatarPreview(URL.createObjectURL(croppedFile));
        } else if (cropTarget === 'banner') {
            setBannerFile(croppedFile);
            setBannerPreview(URL.createObjectURL(croppedFile));
        }
        setCropTarget(null);
        setCropImageSrc(null);
    };

    const handleClearAvatar = (e: React.MouseEvent) => {
        e.stopPropagation();
        setAvatarFile(null);
        setAvatarPreview(null);
        if (avatarInputRef.current) avatarInputRef.current.value = '';
    };

    const handleClearBanner = (e: React.MouseEvent) => {
        e.stopPropagation();
        setBannerFile(null);
        setBannerPreview(null);
        if (bannerInputRef.current) bannerInputRef.current.value = '';
    };

    const handleSave = async () => {
        if (!name.trim()) {
            setError('Name cannot be empty');
            return;
        }

        try {
            setError(null);
            const res = await updateProfile({
                name,
                bio,
                link,
                avatar: avatarFile || undefined,
                banner: bannerFile || undefined,
            });

            if (user && res?.data) {
                setUser({ ...user, ...res.data });
            }

            onClose();
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'Failed to update profile');
            console.error('Failed to update profile', err);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-background/80 backdrop-blur-sm"
                />

                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative flex w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-background border border-border-ui shadow-2xl z-10 sm:max-h-[90vh]"
                >
                    {/* Header */}
                    <div className="flex h-14 shrink-0 items-center justify-between border-b px-4">
                        <div className="flex items-center gap-6">
                            <button
                                onClick={onClose}
                                className="rounded-full cursor-pointer p-2 transition-colors hover:bg-secondary-ui text-foreground"
                            >
                                <X className="h-5 w-5" />
                            </button>
                            <h2 className="text-xl font-bold">Edit profile</h2>
                        </div>
                        <button
                            onClick={handleSave}
                            disabled={isPending || !name.trim()}
                            className="rounded-full cursor-pointer bg-foreground px-5 py-1.5 font-bold text-background transition-transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center min-w-20"
                        >
                            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save'}
                        </button>
                    </div>

                    {/* Form Content */}
                    <div className="flex-1 overflow-y-auto w-full">
                        {error && (
                            <div className="p-4 bg-destructive/10 text-destructive text-sm font-medium flex items-center gap-2">
                                <AlertCircle className="h-4 w-4 shrink-0" />
                                {error}
                            </div>
                        )}

                        {/* Banner Section */}
                        <div className="relative h-48 w-full bg-accent-ui/20 group">
                            {bannerPreview || profile.banner ? (
                                <img
                                    src={bannerPreview || getMediaUrl(profile.banner!)}
                                    alt="Banner"
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <div className="h-full w-full bg-primary-ui/5" />
                            )}
                            <div className="absolute inset-0 bg-black/30 flex items-center justify-center gap-4 opacity-75 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    type="button"
                                    onClick={() => bannerInputRef.current?.click()}
                                    className="rounded-full bg-black/50 p-3 cursor-pointer text-white transition-colors hover:bg-black/70 backdrop-blur-sm"
                                >
                                    <Camera className="h-6 w-6" />
                                </button>
                                {(bannerPreview || profile.banner) && (
                                    <button
                                        type="button"
                                        onClick={handleClearBanner}
                                        className="rounded-full bg-black/50 p-3 text-white transition-colors hover:bg-black/70 backdrop-blur-sm"
                                    >
                                        <X className="h-6 w-6" />
                                    </button>
                                )}
                            </div>

                            <input
                                type="file"
                                ref={bannerInputRef}
                                onChange={handleBannerChange}
                                accept="image/*"
                                className="hidden"
                            />
                        </div>

                        {/* Avatar Section */}
                        <div className="relative px-4 pb-4">
                            <div className="relative -mt-16 sm:-mt-20 inline-block group rounded-full">
                                <div className="h-32 w-32 sm:h-36 sm:w-36 rounded-full border-4 border-background bg-secondary-ui overflow-hidden flex items-center justify-center">
                                    {avatarPreview || profile.avatar ? (
                                        <img
                                            src={avatarPreview || getMediaUrl(profile.avatar!)}
                                            alt="Avatar"
                                            className="h-full w-full object-cover bg-background"
                                        />
                                    ) : (
                                        <span className="text-4xl font-bold opacity-20 uppercase">
                                            {profile.name[0]}
                                        </span>
                                    )}
                                </div>
                                <div className="absolute inset-x-0 inset-y-0 m-1 rounded-full bg-black/30 flex items-center justify-center gap-2  opacity-75 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        type="button"
                                        onClick={() => avatarInputRef.current?.click()}
                                        className="rounded-full bg-black/50 p-2.5 cursor-pointer text-white transition-colors hover:bg-black/70 backdrop-blur-sm"
                                    >
                                        <Camera className="h-5 w-5" />
                                    </button>
                                    {(avatarPreview || profile.avatar) && (
                                        <button
                                            type="button"
                                            onClick={handleClearAvatar}
                                            className="rounded-full bg-black/50 p-2.5 text-white transition-colors hover:bg-black/70 backdrop-blur-sm"
                                        >
                                            <X className="h-5 w-5" />
                                        </button>
                                    )}
                                </div>

                                <input
                                    type="file"
                                    ref={avatarInputRef}
                                    onChange={handleAvatarChange}
                                    accept="image/*"
                                    className="hidden"
                                />
                            </div>

                            {/* Text Inputs */}
                            <div className="mt-4 flex flex-col gap-5 pb-6">
                                <div className="relative flex w-full flex-col rounded-xl border border-border-ui px-4 py-2 focus-within:border-primary-ui focus-within:ring-1 focus-within:ring-primary-ui transition-all">
                                    <div className="flex justify-between items-center text-secondary-foreground opacity-60 text-sm">
                                        <label htmlFor="name" className="pb-1 hover:cursor-text">
                                            Name
                                        </label>
                                        <span className="text-xs">{name.length} / 50</span>
                                    </div>
                                    <input
                                        id="name"
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value.slice(0, 50))}
                                        className="w-full bg-transparent outline-none m-0 p-0 text-foreground"
                                    />
                                </div>

                                <div className="relative flex w-full flex-col rounded-xl border border-border-ui px-4 py-2 focus-within:border-primary-ui focus-within:ring-1 focus-within:ring-primary-ui transition-all">
                                    <div className="flex justify-between items-center text-secondary-foreground opacity-60 text-sm">
                                        <label htmlFor="bio" className="pb-1 hover:cursor-text">
                                            Bio
                                        </label>
                                        <span className="text-xs">{bio.length} / 160</span>
                                    </div>
                                    <textarea
                                        id="bio"
                                        value={bio}
                                        onChange={(e) => setBio(e.target.value.slice(0, 160))}
                                        className="w-full bg-transparent outline-none m-0 p-0 resize-none text-foreground min-h-20"
                                    />
                                </div>

                                <div className="relative flex w-full flex-col rounded-xl border border-border-ui px-4 py-2 focus-within:border-primary-ui focus-within:ring-1 focus-within:ring-primary-ui transition-all">
                                    <div className="flex justify-between items-center text-secondary-foreground opacity-60 text-sm">
                                        <label htmlFor="link" className="pb-1 hover:cursor-text">
                                            Website
                                        </label>
                                        <span className="text-xs">{link.length} / 100</span>
                                    </div>
                                    <input
                                        id="link"
                                        type="text"
                                        value={link}
                                        onChange={(e) => setLink(e.target.value.slice(0, 100))}
                                        className="w-full bg-transparent outline-none m-0 p-0 text-foreground"
                                        placeholder="https://"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            {cropTarget && cropImageSrc && (
                <CropModal
                    imageSrc={cropImageSrc}
                    aspectRatio={cropTarget === 'avatar' ? 1 : 3}
                    onCropComplete={handleCropComplete}
                    onClose={() => {
                        setCropTarget(null);
                        setCropImageSrc(null);
                        if (avatarInputRef.current) avatarInputRef.current.value = '';
                        if (bannerInputRef.current) bannerInputRef.current.value = '';
                    }}
                />
            )}
        </AnimatePresence>
    );
}

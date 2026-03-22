'use client';

import { ArrowLeft, Calendar, Link as LinkIcon, MapPin } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Profile } from '@/types/user';
import { cn, getMediaUrl } from '@/lib/utils';
import { VerificationBadge } from '@/components/ui/verification-badge';
import React, { useState } from 'react';
import EditProfileModal from './edit-profile-modal';

interface ProfileHeaderProps {
    profile: Profile;
    isOwn?: boolean;
}

export default function ProfileHeader({ profile, isOwn }: ProfileHeaderProps) {
    const router = useRouter();
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    return (
        <>
            <div className="flex flex-col border-b">
                {/* Top Navigation */}
                <div className="flex h-14 items-center gap-6 px-4 sticky top-0 bg-background/80 backdrop-blur-md z-20  ">
                    <button
                        onClick={() => router.back()}
                        className="rounded-full p-2 hover:bg-secondary-ui transition-colors text-foreground"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </button>
                    <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-1">
                            <h2 className="text-xl font-bold leading-tight truncate capitalize">
                                {profile.name}
                            </h2>
                            {profile.isVerified && <VerificationBadge size={18} />}
                        </div>
                        <span className="text-sm text-secondary-foreground opacity-60">
                            {profile.postsCount} Posts
                        </span>
                    </div>
                </div>

                {/* Banner / Cover */}
                <div className="relative h-48 w-full bg-accent-ui/20 overflow-hidden">
                    {profile.banner ? (
                        <img
                            src={getMediaUrl(profile.banner)}
                            alt="Banner"
                            className="h-full w-full object-cover select-none"
                            draggable={false}
                        />
                    ) : (
                        <div className="h-full w-full bg-primary-ui/5" />
                    )}
                </div>

                {/* Avatar & Action Button */}
                <div className="relative px-4 pb-4">
                    <div className="flex justify-between items-start">
                        <div className="relative -mt-16 sm:-mt-20">
                            <div className="h-32 w-32 sm:h-36 sm:w-36 rounded-full border-4 border-background bg-secondary-ui overflow-hidden flex items-center justify-center">
                                {profile.avatar ? (
                                    <img
                                        src={getMediaUrl(profile.avatar)}
                                        alt={profile.name}
                                        className="h-full w-full object-cover bg-background select-none"
                                        draggable={false}
                                    />
                                ) : (
                                    <span className="text-4xl font-bold opacity-20 uppercase">
                                        {profile.username[0]}
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="mt-3">
                            {isOwn ? (
                                <button
                                    onClick={() => setIsEditModalOpen(true)}
                                    className="rounded-full border px-4 py-1.5 font-bold hover:bg-secondary-ui transition-colors cursor-pointer"
                                >
                                    Edit profile
                                </button>
                            ) : (
                                <button
                                    className={cn(
                                        'rounded-full px-5 py-1.5 font-bold transition-colors cursor-pointer',
                                        profile.isFollowing
                                            ? 'border hover:bg-destructive/10 hover:text-destructive hover:border-destructive group'
                                            : 'bg-primary-ui text-background hover:opacity-90',
                                    )}
                                >
                                    <span
                                        className={profile.isFollowing ? 'group-hover:hidden' : ''}
                                    >
                                        {profile.isFollowing ? 'Following' : 'Follow'}
                                    </span>
                                    <span className="hidden group-hover:inline">Unfollow</span>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Bio Info */}
                    <div className="mt-4 flex flex-col gap-3">
                        <div className="flex flex-col">
                            <div className="flex items-center gap-1.5 flex-wrap">
                                <h1 className="text-xl font-extrabold leading-tight capitalize">
                                    {profile.name}
                                </h1>
                                {profile.isVerified && <VerificationBadge size={20} />}
                            </div>
                            <span className="text-secondary-foreground opacity-60 select-text">
                                @{profile.username}
                            </span>
                        </div>

                        {profile.bio && (
                            <p className="whitespace-pre-wrap leading-relaxed">{profile.bio}</p>
                        )}

                        <div className="flex flex-wrap gap-4 text-secondary-foreground opacity-70 text-sm">
                            {profile.link && (
                                <div className="flex items-center gap-1">
                                    <LinkIcon className="h-4 w-4" />
                                    <a
                                        href={profile.link}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-primary-ui hover:underline truncate max-w-50"
                                    >
                                        {profile.link.replace(/^https?:\/\//, '')}
                                    </a>
                                </div>
                            )}
                            <div className="flex items-center gap-1 cursor-pointer">
                                <Calendar className="h-4 w-4" />
                                <span>
                                    {profile.createdAt
                                        ? `Joined ${new Date(profile.createdAt).toLocaleDateString()}`
                                        : 'Joined recently'}
                                </span>
                            </div>
                        </div>

                        <div className="flex gap-5 text-sm">
                            <button className="hover:underline flex gap-1 items-center">
                                <span className="font-bold text-foreground">
                                    {profile.followingCount}
                                </span>
                                <span className="text-secondary-foreground opacity-60">
                                    Following
                                </span>
                            </button>
                            <button className="hover:underline flex gap-1 items-center">
                                <span className="font-bold text-foreground">
                                    {profile.followersCount}
                                </span>
                                <span className="text-secondary-foreground opacity-60">
                                    Followers
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <EditProfileModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                profile={profile}
            />
        </>
    );
}

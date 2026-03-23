'use client';

import { ArrowLeft, Calendar, Link as LinkIcon, MapPin } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Profile } from '@/types/user';
import { cn, getMediaUrl } from '@/lib/utils';
import { VerificationBadge } from '@/components/ui/verification-badge';
import React, { useState } from 'react';
import EditProfileModal from './edit-profile-modal';
import Link from 'next/link';

interface ProfileHeaderProps {
    profile: Profile;
    isOwn?: boolean;
    headerType: 'following' | 'followers';
}

export default function FollowingFollowersHeader({
    profile,
    isOwn,
    headerType,
}: ProfileHeaderProps) {
    const router = useRouter();
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    return (
        <>
            <div className="sticky top-0 right-0 flex flex-col border-b">
                {/* Top Navigation */}
                <div className="flex h-14 items-center gap-6 px-4 sticky top-0 bg-background/80 backdrop-blur-md z-20  ">
                    <button
                        onClick={() => router.back()}
                        className="rounded-full p-2 hover:bg-secondary-ui transition-colors text-foreground cursor-pointer"
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
                            {headerType
                                ? `${profile.followingCount} Following`
                                : `${profile.followersCount} followers`}
                        </span>
                    </div>
                </div>
            </div>
        </>
    );
}

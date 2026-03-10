'use client';

import React from 'react';
import { UserProfile } from '@/hooks/useProfile';
import { formatDate } from '@/lib/utils';
import { Calendar, Link as LinkIcon, MapPin } from 'lucide-react';

interface ProfileInfoProps {
    profile: UserProfile;
}

function Stat({ value, label }: { value: number; label: string }) {
    return (
        <button className="flex items-baseline gap-1.5 hover:opacity-70 transition-opacity">
            <span className="text-lg font-black tracking-tight tabular-nums">
                {value.toLocaleString()}
            </span>
            <span className="text-[11px] font-bold text-muted-foreground/50 uppercase tracking-[0.1em]">
                {label}
            </span>
        </button>
    );
}

export function ProfileInfo({ profile }: ProfileInfoProps) {
    return (
        <div className="mt-4 pb-5 border-b border-border/10 space-y-3">
            {/* Name + handle */}
            <div>
                <h1 className="text-2xl font-black tracking-tight leading-none">{profile.name}</h1>
                <p className="text-[12px] font-bold text-muted-foreground/50 mt-1 tracking-wide">
                    @{profile.username}
                </p>
            </div>

            {/* Bio */}
            <p className="text-[14px] leading-relaxed text-foreground/80 max-w-sm">
                {profile.bio || <span className="text-muted-foreground/35">No bio yet.</span>}
            </p>

            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
                {profile.location && (
                    <span className="flex items-center gap-1 text-[12px] text-muted-foreground/55 font-medium">
                        <MapPin className="h-3 w-3 text-primary/50" />
                        {profile.location}
                    </span>
                )}
                {profile.link && (
                    <a
                        href={profile.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-[12px] text-primary font-medium hover:underline hover:opacity-80 transition-opacity"
                    >
                        <LinkIcon className="h-3 w-3" />
                        {profile.link.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                    </a>
                )}
                {profile.createdAt && (
                    <span className="flex items-center gap-1 text-[12px] text-muted-foreground/45 font-medium">
                        <Calendar className="h-3 w-3" />
                        Joined {formatDate(profile.createdAt)}
                    </span>
                )}
            </div>

            {/* Follower stats */}
            <div className="flex items-center gap-5 pt-1">
                <Stat value={profile.followingCount ?? 0} label="Following" />
                <Stat value={profile.followersCount ?? 0} label="Followers" />
            </div>
        </div>
    );
}

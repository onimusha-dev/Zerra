'use client';

import React from 'react';
import { UserProfile } from '@/hooks/useProfile';
import { formatDate } from '@/lib/utils';
import { Calendar, Link as LinkIcon, MapPin } from 'lucide-react';

interface ProfileInfoProps {
    profile: UserProfile;
}

export function ProfileInfo({ profile }: ProfileInfoProps) {
    return (
        <div className="space-y-6 mt-8">
            <div className="space-y-1">
                <h1 className="text-4xl font-black tracking-tighter uppercase italic leading-none">
                    {profile.name}
                </h1>
                <p className="text-sm font-bold tracking-[0.2em] text-muted-foreground/40 uppercase">
                    @{profile.username}
                </p>
            </div>

            <div className="max-w-2xl">
                <p className="text-lg leading-relaxed font-medium text-foreground/80 italic">
                    {profile.bio || 'No biography signal transmitted from this node.'}
                </p>
            </div>

            <div className="flex flex-wrap items-center gap-6 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                {profile.location && (
                    <div className="flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5 text-primary/40" />
                        <span>{profile.location}</span>
                    </div>
                )}
                {profile.link && (
                    <div className="flex items-center gap-2">
                        <LinkIcon className="h-3.5 w-3.5 text-primary/40" />
                        <a
                            href={profile.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline transition-all"
                        >
                            {profile.link.replace(/^https?:\/\//, '')}
                        </a>
                    </div>
                )}
                <div className="flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5 text-primary/40" />
                    <span>Synchronized {formatDate(profile.createdAt!)}</span>
                </div>
            </div>

            <div className="flex gap-8 border-y border-border/10 py-6">
                <div className="flex items-baseline gap-2 group cursor-pointer">
                    <span className="text-2xl font-black tracking-tighter">0</span>
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40 group-hover:text-primary transition-colors">
                        Followers
                    </span>
                </div>
                <div className="flex items-baseline gap-2 group cursor-pointer">
                    <span className="text-2xl font-black tracking-tighter">0</span>
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40 group-hover:text-primary transition-colors">
                        Following
                    </span>
                </div>
            </div>
        </div>
    );
}

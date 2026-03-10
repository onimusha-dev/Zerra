'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { UserProfile } from '@/hooks/useProfile';
import { Edit3 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface IdentityDeckProps {
    profile: UserProfile;
    transmissionCount: number;
    isMe: boolean;
}

export function IdentityDeck({ profile, isMe }: IdentityDeckProps) {
    const router = useRouter();
    const bannerRef = useRef<HTMLDivElement>(null);
    const [isCondensed, setIsCondensed] = useState(false);

    // Watch when the banner scrolls past the top — but only stick after a
    // comfortable amount of scroll (not the very instant the banner starts moving)
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                // When banner is <30% visible, show condensed sticky bar
                setIsCondensed(entry.intersectionRatio < 0.3);
            },
            { threshold: [0, 0.3, 1], rootMargin: '-64px 0px 0px 0px' },
        );
        if (bannerRef.current) observer.observe(bannerRef.current);
        return () => observer.disconnect();
    }, []);

    return (
        <>
            {/* ── Sticky condensed header ── */}
            <div
                className={cn(
                    'sticky top-0 z-40 flex items-center justify-between px-4 h-14',
                    'bg-background/85 backdrop-blur-xl border-b border-border/8',
                    'transition-all duration-300',
                    isCondensed
                        ? 'opacity-100 translate-y-0'
                        : 'opacity-0 -translate-y-full pointer-events-none',
                )}
            >
                <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8 rounded-xl border border-border/10">
                        <AvatarImage src={profile.avatar} className="object-cover" />
                        <AvatarFallback className="text-xs font-black uppercase bg-primary/10 text-primary">
                            {profile.name?.[0]}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="text-sm font-black tracking-tight uppercase leading-none">
                            {profile.name}
                        </p>
                        <p className="text-[9px] font-bold text-muted-foreground/40 uppercase tracking-[0.2em] mt-0.5">
                            @{profile.username}
                        </p>
                    </div>
                </div>
                {isMe && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push('/settings')}
                        className="rounded-2xl h-8 px-4 font-black text-[9px] uppercase tracking-[0.15em] border-border/20 hover:border-primary/30"
                    >
                        <Edit3 className="h-3 w-3 mr-1.5" />
                        Edit
                    </Button>
                )}
            </div>

            {/* ── Full banner section ── */}
            <div className="relative w-full" ref={bannerRef}>
                {/* Banner image */}
                <div className="w-full h-48 overflow-hidden bg-muted/20 relative">
                    {profile.banner ? (
                        <img
                            src={profile.banner}
                            alt="banner"
                            className="w-full h-full object-cover select-none"
                            draggable={false}
                        />
                    ) : (
                        <div className="w-full h-full bg-linear-to-br from-primary/8 via-muted/10 to-primary/5" />
                    )}
                    <div className="absolute inset-0 bg-linear-to-t from-background via-background/10 to-transparent" />
                </div>

                {/* Avatar + action row */}
                <div className="relative flex items-end justify-between px-4 -mt-12 pb-1">
                    <Avatar className="h-24 w-24 rounded-3xl border-4 border-background shadow-2xl ring-1 ring-border/10">
                        <AvatarImage src={profile.avatar} className="object-cover" />
                        <AvatarFallback className="text-3xl font-black uppercase bg-primary/10 text-primary">
                            {profile.name?.[0]}
                        </AvatarFallback>
                    </Avatar>

                    {isMe && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push('/settings')}
                            className="rounded-2xl h-9 px-5 font-black text-[10px] uppercase tracking-[0.2em] border-border/20 hover:border-primary/40 hover:bg-primary/5 transition-all"
                        >
                            <Edit3 className="h-3.5 w-3.5 mr-2" />
                            Edit Profile
                        </Button>
                    )}
                </div>
            </div>
        </>
    );
}

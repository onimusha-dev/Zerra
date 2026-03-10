import React from 'react';
import Link from 'next/link';
import { User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User as UserType } from '@/types';

interface SidebarUserProps {
    user: UserType | null;
    loading?: boolean;
}

export function SidebarUser({ user, loading }: SidebarUserProps) {
    if (loading) {
        return (
            <div className="flex items-center gap-3 p-2">
                <div className="h-10 w-10 rounded-2xl animate-pulse bg-muted shrink-0" />
                <div className="hidden lg:flex flex-col gap-1.5">
                    <div className="h-2.5 w-24 rounded-full animate-pulse bg-muted" />
                    <div className="h-2 w-16 rounded-full animate-pulse bg-muted" />
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <Link
                href="/auth/login"
                className="flex items-center justify-center lg:justify-start gap-3 p-3 rounded-2xl hover:bg-muted/30 transition-all group"
            >
                <div className="h-10 w-10 rounded-2xl bg-muted/40 border border-border/10 flex items-center justify-center group-hover:border-primary/20 transition-colors">
                    <User className="h-4 w-4 text-muted-foreground/40" />
                </div>
                <span className="hidden lg:inline text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 group-hover:text-foreground transition-colors">
                    Sign In
                </span>
            </Link>
        );
    }

    return (
        <Link
            href={`/profile?username=${user.username}`}
            className="flex items-center justify-center lg:justify-start gap-3 rounded-2xl hover:bg-muted/30 border border-transparent hover:border-border/10 transition-all duration-200 group pb-3"
        >
            {/* Avatar */}
            <div className="relative shrink-0">
                <Avatar className="h-12 w-12 rounded-2xl border border-border/10 transition-all">
                    <AvatarImage src={user.avatar} className="object-cover" />
                    <AvatarFallback className="bg-primary/10 text-primary font-black text-xs uppercase">
                        {(user.name || 'U')[0]}
                    </AvatarFallback>
                </Avatar>
                {/* Online dot */}
                <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-emerald-500 border-2 border-background rounded-full" />
            </div>

            {/* Name + handle */}
            <div className="hidden lg:flex flex-col min-w-0">
                <span className="text-md font-black uppercase tracking-tight truncate leading-none transition-colors">
                    {user.name}
                </span>
                <span className="text-sm font-bold text-muted-foreground/35 truncate tracking-[0.15em] uppercase mt-1.5 transition-colors">
                    @{user.username}
                </span>
            </div>
        </Link>
    );
}

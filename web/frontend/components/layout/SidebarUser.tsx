import React from 'react';
import Link from 'next/link';
import { User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface SidebarUserProps {
    user: any;
    loading?: boolean;
}

export function SidebarUser({ user, loading }: SidebarUserProps) {
    if (loading) {
        return <div className="h-10 w-10 animate-pulse bg-muted rounded-full mx-auto" />;
    }

    if (!user) {
        return (
            <Link
                href="/auth/login"
                className="flex items-center justify-center h-10 w-10 text-primary/60 hover:text-primary transition-all active:scale-95"
            >
                <User className="h-6 w-6" />
            </Link>
        );
    }

    return (
        <Link
            href={`/profile?username=${user.username}`}
            className="flex items-center justify-center xl:justify-start gap-4 p-2 rounded-2xl hover:bg-muted/50 transition-all group outline-none overflow-hidden"
        >
            <Avatar className="h-10 w-10 rounded-full border border-border/10 group-hover:border-primary/40 transition-all shrink-0 shadow-lg">
                <AvatarImage src={user.avatar} className="object-cover" />
                <AvatarFallback className="bg-muted text-foreground font-bold text-sm uppercase italic">
                    {(user.name || 'U')[0]}
                </AvatarFallback>
            </Avatar>
            <div className="hidden xl:flex flex-col truncate pr-4">
                <span className="font-bold text-xs truncate tracking-tighter group-hover:text-primary transition-colors leading-none uppercase">
                    {user.name}
                </span>
                <span className="text-muted-foreground/40 text-[9px] font-bold truncate uppercase tracking-widest mt-1">
                    @{user.username}
                </span>
            </div>
        </Link>
    );
}

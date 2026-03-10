import React from 'react';
import { ArrowLeft, Verified } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '../ui/button';

interface ProfileHeaderProps {
    name: string;
    transmissionCount: number;
    isMe: boolean;
}

export function ProfileHeader({ name, transmissionCount, isMe }: ProfileHeaderProps) {
    const router = useRouter();

    return (
        <div className="sticky top-0 z-40 bg-back bg-blue-600 ground/80 backdrop-blur-md px-4 py-8 flex items-center justify-between border-b border-border/10">
            <div className="flex items-center gap-4 text-left">
                <Button
                    variant="outline"
                    size="icon"
                    className="rounded-none h-9 w-9 border-border/20 hover:border-primary/40 transition-colors"
                    onClick={() => router.back()}
                >
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <div className="flex items-center gap-2">
                        <h1 className="text-xl font-bold tracking-tighter uppercase leading-none">
                            {name}
                        </h1>
                        <Verified className="h-4 w-4" />
                    </div>
                    <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-primary/40 mt-1">
                        Persona Node · {transmissionCount} Transmissions
                    </p>
                </div>
            </div>
            <div className="flex items-center gap-4">
                {isMe ? (
                    <Button
                        variant="outline"
                        className="h-9 rounded-none border-border/20 text-[9px] font-bold uppercase tracking-widest px-6 hover:bg-primary hover:text-primary-foreground transition-all"
                        onClick={() => router.push('/settings')}
                    >
                        Configure Node
                    </Button>
                ) : (
                    <Button className="btn-primary h-9 px-8">Follow Signal</Button>
                )}
            </div>
        </div>
    );
}

import React from 'react';
import { Zap } from 'lucide-react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen items-center justify-center p-6 relative overflow-hidden bg-background">
            <div className="w-full max-w-md relative z-10 flex flex-col gap-12">
                <div className="flex flex-col items-center group">
                    <div className="h-14 w-14 bg-foreground rounded-sm flex items-center justify-center mb-6">
                        <Zap className="h-8 w-8 text-background fill-current" />
                    </div>
                    <h1 className="text-4xl font-bold tracking-tighter uppercase italic leading-none">
                        Zerra
                    </h1>
                    <p className="text-muted-foreground/40 font-black uppercase tracking-[0.4em] text-[10px] mt-2">
                        Identity Engagement Node
                    </p>
                </div>

                <div className="minimal-card p-10 border-border/60">{children}</div>

                <div className="text-center opacity-10">
                    <p className="text-[10px] font-black tracking-[0.5em] uppercase italic">
                        System Version Alpha-1.0
                    </p>
                </div>
            </div>
        </div>
    );
}

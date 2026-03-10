import React from 'react';
import { Shield, ArrowLeft, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';

interface SecurityProtocolsProps {
    twoFactorEnabled?: boolean;
}

export function SecurityProtocols({ twoFactorEnabled }: SecurityProtocolsProps) {
    const router = useRouter();

    return (
        <div className="mt-16 space-y-8">
            <h2 className="text-xl font-bold tracking-tighter uppercase leading-none px-1">
                Security Protocols
            </h2>

            <div className="minimal-card p-10 border-border/60">
                <div className="space-y-8">
                    <div className="flex items-center justify-between p-6 border border-border/40 rounded-sm">
                        <div className="flex items-center gap-6">
                            <div className="h-10 w-10 bg-muted/50 rounded-sm border border-border flex items-center justify-center">
                                <Shield className="h-4 w-4" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-bold tracking-tight leading-none uppercase">
                                    Dual-Layer Sync
                                </p>
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mt-1">
                                    Two-Factor Authentication
                                </p>
                            </div>
                        </div>
                        <Switch checked={twoFactorEnabled} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Button
                            variant="outline"
                            className="h-16 rounded-sm border-border/40 hover:bg-muted/30 flex items-center justify-between px-6 group"
                            onClick={() => router.push('/settings')}
                        >
                            <div className="flex flex-col items-start gap-1 text-left">
                                <span className="font-bold text-[10px] uppercase tracking-widest">
                                    Secret Rotation
                                </span>
                                <span className="text-[8px] text-muted-foreground/40 font-black uppercase tracking-[0.2em]">
                                    Change Password
                                </span>
                            </div>
                            <ArrowLeft className="h-3 w-3 rotate-180 opacity-40 group-hover:opacity-100 transition-all" />
                        </Button>

                        <Button
                            variant="outline"
                            className="h-16 rounded-sm border-destructive/20 hover:bg-destructive/5 flex items-center justify-between px-6 group"
                            onClick={() => router.push('/settings')}
                        >
                            <div className="flex flex-col items-start gap-1 text-left">
                                <span className="font-bold text-[10px] uppercase tracking-widest text-destructive">
                                    Deconstruct Node
                                </span>
                                <span className="text-[8px] text-destructive/40 font-black uppercase tracking-[0.2em]">
                                    Delete Identity
                                </span>
                            </div>
                            <Trash2 className="h-3 w-3 text-destructive opacity-40 group-hover:opacity-100 transition-all" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

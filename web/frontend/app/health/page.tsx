'use client';

import React from 'react';
import {
    CheckCircle2,
    AlertCircle,
    Loader2,
    RefreshCcw,
    Server,
    Database,
    Zap,
    Activity,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useHealthStatus } from '@/hooks/useHealthStatus';
import { StatusModule } from '@/components/health/StatusModule';

export default function HealthPage() {
    const { health, isLoading, refresh } = useHealthStatus();

    return (
        <div className="flex flex-col min-h-screen">
            <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-sm px-2 py-8 mb-10 flex items-center justify-between border-b border-border/40">
                <div>
                    <h1 className="text-2xl font-bold tracking-tighter uppercase leading-none">
                        Status
                    </h1>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground mt-1">
                        Zerra Core Diagnostics
                    </p>
                </div>
                <Button
                    onClick={refresh}
                    variant="outline"
                    size="icon"
                    className="rounded-sm h-9 w-9 border-border/60 transition-transform active:rotate-180 duration-500"
                >
                    {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <RefreshCcw className="h-4 w-4" />
                    )}
                </Button>
            </div>

            <div className="space-y-10">
                <div className="minimal-card p-12 flex flex-col items-center text-center space-y-6 text-foreground">
                    <div
                        className={cn(
                            'p-8 rounded-sm bg-muted/30 border border-border shadow-inner transition-all duration-700',
                            health?.status === 'Operational'
                                ? 'text-foreground'
                                : 'text-destructive',
                        )}
                    >
                        {health?.status === 'Operational' ? (
                            <CheckCircle2 className="h-16 w-16" />
                        ) : (
                            <AlertCircle className="h-16 w-16" />
                        )}
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-4xl font-black tracking-tight leading-none uppercase">
                            {health?.status || 'Analyzing...'}
                        </h2>
                        <p className="text-muted-foreground/60 text-[10px] font-black uppercase tracking-[0.4em]">
                            Integrated Protocol Heartbeat
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <StatusModule
                        icon={Server}
                        label="Core Signal"
                        description="API Logic Layer"
                        status={health?.status === 'Operational' ? 'up' : 'down'}
                    />
                    <StatusModule
                        icon={Database}
                        label="Data Vault"
                        description="PostgreSQL Storage"
                        status={health?.database === 'up' ? 'up' : 'down'}
                    />
                    <StatusModule
                        icon={Zap}
                        label="Quick Access"
                        description="Redis Speed Layer"
                        status={health?.redis === 'up' ? 'up' : 'down'}
                    />
                    <StatusModule
                        icon={Activity}
                        label="Mesh Network"
                        description="Sync Engines"
                        status="up"
                    />
                </div>

                <div className="pt-20 border-t border-border/40 flex flex-col lg:flex-row items-center justify-between gap-8 pb-10 opacity-30">
                    <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.5em] text-foreground">
                        <Activity className="h-3 w-3" /> Latest Scan: {health?.timestamp || '---'}
                    </div>
                    <p className="text-[10px] text-foreground uppercase tracking-widest font-black max-w-sm text-right leading-relaxed">
                        Diagnostics reflect node readiness. Real-time monitoring active.
                    </p>
                </div>
            </div>
        </div>
    );
}

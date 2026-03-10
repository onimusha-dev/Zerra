import React from 'react';
import { cn } from '@/lib/utils';

interface StatusModuleProps {
    icon: any;
    label: string;
    description: string;
    status: 'up' | 'down';
}

export function StatusModule({ icon: Icon, label, description, status }: StatusModuleProps) {
    const isUp = status === 'up';
    return (
        <div className="minimal-card p-6 border-border/40 transition-all duration-500 hover:border-border group">
            <div className="flex items-start justify-between">
                <div className="flex gap-4">
                    <div className="h-12 w-12 bg-muted/50 rounded-sm flex items-center justify-center border border-border">
                        <Icon
                            className={cn('h-5 w-5', isUp ? 'text-foreground' : 'text-destructive')}
                        />
                    </div>
                    <div className="flex flex-col justify-center">
                        <span className="font-bold text-sm tracking-tight leading-none mb-1">
                            {label}
                        </span>
                        <span className="text-[10px] text-muted-foreground/60 font-black uppercase tracking-widest">
                            {description}
                        </span>
                    </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                    <div
                        className={cn(
                            'px-2 py-0.5 rounded-sm text-[8px] font-black uppercase tracking-widest border',
                            isUp
                                ? 'border-foreground/20 text-foreground bg-foreground/5'
                                : 'border-destructive/20 text-destructive bg-destructive/5',
                        )}
                    >
                        {isUp ? 'Active' : 'Offline'}
                    </div>
                </div>
            </div>
        </div>
    );
}

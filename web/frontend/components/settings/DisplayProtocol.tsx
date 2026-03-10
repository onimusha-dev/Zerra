import React from 'react';
import { Moon } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

export function DisplayProtocol() {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-border/40 rounded-none interactive-hover transition-colors">
                <div className="flex items-center gap-4">
                    <Moon className="h-4 w-4" />
                    <div>
                        <p className="text-sm font-bold uppercase italic tracking-tight leading-none">
                            Onyx Interface
                        </p>
                        <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/40 mt-1">
                            Absolute Dark Protocol
                        </p>
                    </div>
                </div>
                <Switch checked={true} disabled className="data-[state=checked]:bg-foreground" />
            </div>
        </div>
    );
}

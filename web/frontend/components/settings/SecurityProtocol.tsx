import React from 'react';
import { Lock } from 'lucide-react';

export function SecurityProtocol() {
    return (
        <div className="p-24 text-center border border-dashed border-border/40 rounded-none opacity-20">
            <Lock className="h-8 w-8 mx-auto mb-6 opacity-40" />
            <p className="text-[9px] font-bold uppercase tracking-[0.4em] italic mb-2">
                Vault Sealed
            </p>
            <p className="text-[9px] font-bold uppercase tracking-widest">
                Quantum verification required.
            </p>
        </div>
    );
}

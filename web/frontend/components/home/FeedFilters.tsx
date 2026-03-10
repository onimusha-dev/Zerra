import React from 'react';

export function FeedFilters() {
    return (
        <div className="flex items-center gap-8 border-b border-border/10 pb-4">
            <button className="text-[10px] font-bold uppercase tracking-[0.2em] border-b-2 border-primary text-foreground pb-4 -mb-[18px] italic">
                Synchronic Stream
            </button>
            <button className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/20 hover:text-primary transition-colors pb-4 -mb-[18px]">
                Archival Editorial
            </button>
        </div>
    );
}

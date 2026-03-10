import React from 'react';
import { cn } from '@/lib/utils';

const FILTERS = [
    { id: 'stream', label: 'Synchronic Stream' },
    { id: 'editorial', label: 'Archival Editorial' },
] as const;

type FilterId = (typeof FILTERS)[number]['id'];

interface FeedFiltersProps {
    active?: FilterId;
    onChange?: (id: FilterId) => void;
}

export function FeedFilters({ active = 'stream', onChange }: FeedFiltersProps) {
    return (
        <div className="flex items-center gap-8 border-b border-border/10 pb-4">
            {FILTERS.map((f) => (
                <button
                    key={f.id}
                    onClick={() => onChange?.(f.id)}
                    className={cn(
                        'text-[10px] font-bold uppercase tracking-[0.2em] pb-4 -mb-[18px] transition-colors',
                        active === f.id
                            ? 'border-b-2 border-primary text-foreground'
                            : 'text-muted-foreground/20 hover:text-muted-foreground/60',
                    )}
                >
                    {f.label}
                </button>
            ))}
        </div>
    );
}

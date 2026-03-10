'use client';

import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme, COLOR_SCHEMES, ThemeMode } from '@/contexts/ThemeContext';

const MODES: { id: ThemeMode; label: string; icon: React.ElementType }[] = [
    { id: 'light', label: 'Light', icon: Sun },
    { id: 'dark', label: 'Dark', icon: Moon },
];

// Rendered dot colors — must be static Tailwind-safe or inline styles
const SCHEME_DOT_COLORS: Record<string, string> = {
    mono: '#e8e8e8',
    violet: '#a855f7',
    rose: '#f43f5e',
    sky: '#38bdf8',
    emerald: '#34d399',
    amber: '#fbbf24',
};

export function DisplayProtocol() {
    const { mode, scheme, setMode, setScheme } = useTheme();

    return (
        <div className="space-y-8">
            {/* Mode */}
            <section className="space-y-3">
                <div>
                    <h3 className="text-[11px] font-black uppercase tracking-[0.25em] text-foreground">
                        Mode
                    </h3>
                    <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40 mt-0.5">
                        Visual interface brightness
                    </p>
                </div>
                <div className="flex gap-3">
                    {MODES.map(({ id, label, icon: Icon }) => (
                        <button
                            key={id}
                            onClick={() => setMode(id)}
                            className={cn(
                                'flex items-center gap-3 px-5 py-3.5 rounded-2xl border text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-200 flex-1 justify-center',
                                mode === id
                                    ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20'
                                    : 'bg-muted/20 border-border/10 text-muted-foreground/50 hover:border-border/30 hover:text-foreground',
                            )}
                        >
                            <Icon className="h-4 w-4" />
                            {label}
                        </button>
                    ))}
                </div>
            </section>

            {/* Color Scheme */}
            <section className="space-y-3">
                <div>
                    <h3 className="text-[11px] font-black uppercase tracking-[0.25em] text-foreground">
                        Color Scheme
                    </h3>
                    <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40 mt-0.5">
                        Primary accent color across the interface
                    </p>
                </div>

                {/* Swatch grid */}
                <div className="flex flex-wrap gap-4 pt-1">
                    {COLOR_SCHEMES.map((s) => {
                        const isActive = scheme.id === s.id;
                        return (
                            <button
                                key={s.id}
                                onClick={() => setScheme(s)}
                                title={s.label}
                                className="flex flex-col items-center gap-2 group"
                            >
                                <div
                                    className={cn(
                                        'h-9 w-9 rounded-full border-2 transition-all duration-200',
                                        isActive
                                            ? 'scale-110 shadow-lg ring-2 ring-offset-2 ring-offset-background'
                                            : 'border-border/20 opacity-60 hover:opacity-100 hover:scale-105',
                                    )}
                                    style={{
                                        backgroundColor: SCHEME_DOT_COLORS[s.id],
                                        borderColor: isActive ? SCHEME_DOT_COLORS[s.id] : undefined,
                                        // @ts-ignore
                                        '--tw-ring-color': SCHEME_DOT_COLORS[s.id],
                                    }}
                                />
                                <span
                                    className={cn(
                                        'text-[8px] font-black uppercase tracking-[0.2em] transition-colors',
                                        isActive ? 'text-foreground' : 'text-muted-foreground/30',
                                    )}
                                >
                                    {s.label}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* Current scheme preview */}
                <div className="mt-4 p-4 rounded-2xl bg-muted/10 border border-border/10 flex items-center gap-4">
                    <div
                        className="h-10 w-10 rounded-xl shrink-0 shadow-md"
                        style={{ backgroundColor: SCHEME_DOT_COLORS[scheme.id] }}
                    />
                    <div>
                        <p className="text-[11px] font-black uppercase tracking-[0.2em]">
                            {scheme.label}
                        </p>
                        <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40 mt-0.5">
                            Active color protocol
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
}

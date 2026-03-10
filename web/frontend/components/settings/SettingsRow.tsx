import React from 'react';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SettingsRowProps {
    icon: any;
    label: string;
    description: string;
    onClick?: () => void;
    className?: string;
    rightElement?: React.ReactNode;
}

export function SettingsRow({
    icon: Icon,
    label,
    description,
    onClick,
    className,
    rightElement,
}: SettingsRowProps) {
    const Component = onClick ? 'button' : 'div';

    return (
        <Component
            onClick={onClick}
            className={cn(
                'w-full flex items-center justify-between p-5 border border-border/10 rounded-none hover:border-primary/20 transition-all text-left group interactive-hover bg-secondary/10',
                className,
            )}
        >
            <div className="flex items-center gap-5">
                <div className="h-10 w-10 rounded-none bg-secondary/30 border border-border/10 flex items-center justify-center group-hover:border-primary/30 transition-colors">
                    <Icon className="h-4 w-4 text-primary/40 group-hover:text-primary transition-colors" />
                </div>
                <div>
                    <span className="font-bold text-sm tracking-tight italic block uppercase leading-none mb-1.5">
                        {label}
                    </span>
                    <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/20 group-hover:text-foreground/60 transition-colors">
                        {description}
                    </span>
                </div>
            </div>
            {rightElement
                ? rightElement
                : onClick && (
                      <ChevronRight className="h-3 w-3 text-muted-foreground/20 group-hover:translate-x-1 group-hover:text-primary transition-all" />
                  )}
        </Component>
    );
}
